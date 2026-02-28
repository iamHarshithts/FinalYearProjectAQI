import React, { useState, useEffect } from 'react';
import { 
  Wind, MapPin, Navigation, Calendar, Map as MapIcon, 
  Activity, Info, CloudRain, AlertCircle 
} from 'lucide-react';
const TabNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', icon: Info, label: 'Today' },
    { id: 'heatmap', icon: MapIcon, label: 'Heatmap' },
    { id: 'forecast', icon: Calendar, label: '3-Day Forecast' }
  ];

  return (
    <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white mb-8 shadow-sm w-fit mx-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === tab.id ? 'bg-white text-yellow-500 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNav