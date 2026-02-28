import React, { useState, useEffect } from 'react';
import { 
  Wind, MapPin, Navigation, Calendar, Map as MapIcon, 
  Activity, Info, CloudRain, AlertCircle,BrainCircuit
} from 'lucide-react';

const Header = ({ lat, lon, setLat, setLon, onCheck, onGPS, loading }) => (
  <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
    <div className="flex items-center gap-3">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Air Quality Index </h1>
        <p className="text-slate-500 font-medium">Real-time Monitoring</p>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex-1">
        <input 
          type="number" placeholder="Lat" value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="w-full px-3 py-2 bg-transparent outline-none text-sm"
        />
        <input 
          type="number" placeholder="Lon" value={lon}
          onChange={(e) => setLon(e.target.value)}
          className="w-full px-3 py-2 bg-transparent outline-none text-sm border-l"
        />
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onCheck} disabled={loading}
          className="border-2 border-yellow-500 text-yellow-500 bg-white hover:bg-yellow-500 hover:text-white hover:border-yellow-500 text-black px-6 py-1 rounded-xl font-semibold transition-all shadow-lg shadow-black-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
         Check AQI
        </button>
        <button 
          onClick={onGPS}
          className="border-2 border-yellow-500 text-yellow-500 bg-white hover:bg-yellow-500 hover:text-white hover:border-yellow-500 text-black px-6 flex items-center gap-2 py-1 rounded-xl transition-all font-semibold shadow-lg shadow-black-100 active:scale-95"
        >
          <Navigation size={22} /> My Location
        </button>
      </div>
    </div>
  </header>
);
export default Header