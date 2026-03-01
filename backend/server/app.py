from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, joblib, os, gdown

App = Flask(__name__)
CORS(App, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})

ModelPath = "model/random_forest_model.pkl"
if not os.path.exists(ModelPath):
    os.makedirs(os.path.dirname(ModelPath), exist_ok=True)
    gdown.download(
        "https://drive.google.com/uc?id=1M-JzFwzVUhLjO_ZyRSMNi8FpN3CYGztx",
        ModelPath,
        quiet=False
    )
Model = joblib.load(ModelPath)
Features = ['pm2_5','pm10','no','no2','nox','nh3','co','so2','o3']

BREAKPOINTS = {
    "pm2_5": [[0,30,0,50],[30,60,51,100],[60,90,101,200],[90,120,201,300],[120,250,301,400],[250,400,401,500]],
    "pm10":  [[0,50,0,50],[50,100,51,100],[100,250,101,200],[250,350,201,300],[350,430,301,400],[430,500,401,500]],
    "no2":   [[0,40,0,50],[40,80,51,100],[80,180,101,200],[180,280,201,300],[280,400,301,400],[400,500,401,500]],
    "so2":   [[0,40,0,50],[40,80,51,100],[80,380,101,200],[380,800,201,300],[800,1600,301,400],[1600,2000,401,500]],
    "co":    [[0,1,0,50],[1,2,51,100],[2,10,101,200],[10,17,201,300],[17,34,301,400],[34,50,401,500]]
}

def ClassifyAqi(Aqi):
    if Aqi <= 50:
        return "Good", "#047236", "Air quality is considered satisfactory, and air pollution poses little or no risk."
    elif Aqi <= 100:
        return "Satisfactory", "#90EE90", "Air quality is acceptable; however, there may be some concern for a small number of people."
    elif Aqi <= 200:
        return "Moderate", "#EFC015", "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
    elif Aqi <= 300:
        return "Poor", "#FF9900", "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."
    elif Aqi <= 400:
        return "Very Poor", "#FF0000", "Health alert: everyone may experience more serious health effects."
    else:
        return "Severe", "#C00000", "Health warnings of emergency conditions. The entire population is more likely to be affected."

def CalculateSubIndex(Conc, Pollutant):
    Bp = BREAKPOINTS.get(Pollutant)
    if not Bp: return 0
    for Clow, Chigh, Ilow, Ihigh in Bp:
        if Clow <= Conc <= Chigh:
            return Ilow + ((Ihigh - Ilow) / (Chigh - Clow)) * (Conc - Clow)
    return 500

def CalculateIndianAqi(Components):
    CoMg = Components.get('co', 0) / 1000.0
    Indices = [
        CalculateSubIndex(Components.get('pm2_5', 0), 'pm2_5'),
        CalculateSubIndex(Components.get('pm10', 0), 'pm10'),
        CalculateSubIndex(Components.get('no2', 0), 'no2'),
        CalculateSubIndex(Components.get('so2', 0), 'so2'),
        CalculateSubIndex(CoMg, 'co')
    ]
    return round(max(Indices), 2)

def GetPollutionData(Lat, Lon):
    Url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={Lat}&lon={Lon}&appid=9c9815bb312b7d2d7b1dda93051932a5"
    Resp = requests.get(Url).json()
    Data = Resp["list"][0]["components"]
    return [
        Data.get('pm2_5', 0),
        Data.get('pm10', 0),
        Data.get('no', 0),
        Data.get('no2', 0),
        Data.get('no', 0) + Data.get('no2', 0),
        Data.get('nh3', 0),
        Data.get('co', 0),
        Data.get('so2', 0),
        Data.get('o3', 0)
    ]

@App.route("/", methods=["GET"])
def Home():
    return jsonify({
        "status": "Online",
        "message": "AQI Backend Engine is live",
        "endpoints": {"predict": "/predict?lat=LAT&lon=LON"}
    }), 200

@App.route("/predict", methods=["GET", "OPTIONS"])
def Predict():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    Lat = request.args.get("lat")
    Lon = request.args.get("lon")

    if not Lat or not Lon:
        return jsonify({"error": "Latitude and Longitude are required"}), 400

    try:
        # 1. Get raw pollution data from OpenWeather
        Values = GetPollutionData(Lat, Lon)

        # 2. ML Prediction (Random Forest) - kept for reference
        MlAqi = round(Model.predict([Values])[0], 3)

        # 3. Recalculate using official CPCB breakpoints
        ComponentsDict = dict(zip(Features, Values))
        CpcbAqi = CalculateIndianAqi(ComponentsDict)  # ✅ e.g. 20

        # 4. Classify using CPCB value, NOT raw ML output
        Label, Color, Insight = ClassifyAqi(CpcbAqi)  # ✅ 20 → Green

        print(f"ML Raw: {MlAqi} | CPCB Recalculated: {CpcbAqi} | Category: {Label}")

        return jsonify({
            "cpcb_aqi": CpcbAqi,       # ✅ recalculated CPCB value (e.g. 20         # raw model output kept for reference
            "category": Label,
            "color": Color,
            "insight": Insight,
            "pollutants": ComponentsDict,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    App.run(host="0.0.0.0", port=5000, debug=True)