import { 
  Wind, MapPin, Navigation, Calendar, Map as MapIcon, 
  Activity, Info, CloudRain, AlertCircle 
} from 'lucide-react';
const AQIOverview= ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in">
    <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-xl border border-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10"><Wind size={120} /></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Current AQI</p>
      <h2 className="text-6xl font-black mb-4" style={{ color: data.color }}>{data.cpcb_aqi}</h2>
      <div className="inline-block px-4 py-1.5 rounded-full text-white font-bold text-sm mb-6" style={{ backgroundColor: data.color }}>
        {data.category}
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl">
        <p className="text-slate-500 text-xs font-bold mb-1 uppercase">Health Insight</p>
        <p className="text-sm font-medium leading-relaxed italic">"{data.category} conditions detected. Exercise caution if in sensitive groups."</p>
      </div>
    </div>

    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
      {Object.entries(data.pollutants).map(([key, val]) => (
        <div key={key} className="bg-white/80 p-5 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest group-hover:text-blue-500 transition-colors">{key.replace('_', '.')}</span>
            <span className="text-xs text-slate-300 font-medium">µg/m³</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{val.toFixed(2)}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-400 h-full rounded-full" style={{ width: `${Math.min((val / 200) * 100, 100)}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default AQIOverview;