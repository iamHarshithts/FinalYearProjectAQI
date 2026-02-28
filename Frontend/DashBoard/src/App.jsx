import { useState ,useEffect} from 'react'
import {
  Wind, MapPin, Navigation, Calendar, Map as MapIcon,
  Activity, Info, CloudRain, AlertCircle
} from 'lucide-react';
import Header from './components/Header'
import ForecastView from './components/ForecastView'
import AQIOverview from './components/AQIOverview';
import HeatmapView from './components/HeatmapView'
import TabNav from './components/TabNav'
import SplashScreen from './components/SplashScreen';
import { API_BASE_URL, OWM_API_KEY } from './constants/config'
import './App.css'
import './index.css'
const App = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // splash duration

    return () => clearTimeout(timer);
  }, []);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [forecast, setForecast] = useState([]);

  const fetchAqi = async (tLat, tLon) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/predict?lat=${tLat}&lon=${tLon}`);
      if (!response.ok) throw new Error("Backend Offline");
      const data = await response.json();
      setAqiData(data);
      fetchForecast(tLat, tLon);
    } catch (err) {
      setError("Enter Latitude and Longitude Please");
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (tLat, tLon) => {
    try {
      const response = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${tLat}&lon=${tLon}&appid=${OWM_API_KEY}`);
      const data = await response.json();
      const daily = [];
      const seen = new Set();
      data.list.forEach(item => {
        const d = new Date(item.dt * 1000).toLocaleDateString();
        if (!seen.has(d) && daily.length < 3) {
          seen.add(d);
          daily.push({ date: d, aqi: item.main.aqi, components: item.components });
        }
      });
      setForecast(daily);
    } catch (err) { console.error(err); }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return setError("GPS not supported");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(4));
        setLon(pos.coords.longitude.toFixed(4));
        fetchAqi(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => { setError(err.message); setLoading(false); }
    );
  };
  if (showSplash) {
    return <SplashScreen />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        <Header
          lat={lat} lon={lon} setLat={setLat} setLon={setLon}
          onCheck={() => fetchAqi(lat, lon)} onGPS={handleGPS} loading={loading}
        />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-bounce">
            <AlertCircle size={20} /> <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 font-medium animate-pulse">Syncing with atmospheric sensors...</p>
            </div>
          ) : aqiData ? (
            <>
              {activeTab === 'overview' && <AQIOverview data={aqiData} />}
              {activeTab === 'heatmap' && <HeatmapView lat={lat} lon={lon} />}
              {activeTab === 'forecast' && <ForecastView
                forecast={forecast}
                loading={loading}
                lat={lat}
                lon={lon}
              />}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6"><Activity className="text-yellow-500" size={40} /></div>
              <h2 className="text-2xl font-black text-slate-900">Atmospheric Data Pending</h2>
              <p className="text-slate-500 max-w-xs mx-auto text-sm mt-2">Enter coordinates or use GPS to begin real-time analysis.</p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;