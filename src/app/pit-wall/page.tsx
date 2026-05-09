'use client';

import { useEffect, useState } from 'react';

interface RaceMessage {
  date: string;
  message: string;
  category: string;
  flag: string;
}

interface Weather {
  track_temperature: number;
  air_temperature: number;
  rainfall: number;
  wind_speed: number;
}

export default function PitWallPage() {
  const [messages, setMessages] = useState<RaceMessage[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveStatus() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
      console.log('Fetching live data from:', apiUrl);
      
      try {
        const [msgRes, weatherRes] = await Promise.all([
          fetch(`${apiUrl}/test/race-control`),
          fetch(`${apiUrl}/test/weather`)
        ]);

        const msgData = await msgRes.json();
        const weatherData = await weatherRes.json();
        console.log('Pit Wall Data:', { msgData, weatherData });

        if (msgData.status === 'Success') setMessages(msgData.data.slice(-10).reverse());
        if (weatherData.status === 'Success' && weatherData.data.length > 0) {
          setWeather(weatherData.data[weatherData.data.length - 1]);
        }
      } catch (err) {
        console.error("Failed to fetch live data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 font-mono">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-f1-red uppercase italic">The Pit Wall</h1>
        {weather && (
          <div className="flex gap-6 bg-carbon-grey/20 p-4 border border-carbon-grey rounded shadow-inner">
            <div className="text-center">
              <p className="text-[10px] text-white/40 uppercase">Track Temp</p>
              <p className="text-xl font-bold text-white">{weather.track_temperature}°C</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-white/40 uppercase">Air Temp</p>
              <p className="text-xl font-bold text-white">{weather.air_temperature}°C</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-white/40 uppercase">Rain</p>
              <p className={`text-xl font-bold ${weather.rainfall > 0 ? 'text-blue-400' : 'text-f1-red'}`}>
                {weather.rainfall > 0 ? 'YES' : 'NO'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Map */}
        <div className="lg:col-span-2 border border-carbon-grey bg-carbon-grey/30 rounded p-6 h-[500px] flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-4 left-4 text-[10px] text-f1-red uppercase font-bold tracking-widest bg-black/50 p-2 border border-f1-red/20 rounded">
            Live Track Position (Simulation)
          </div>
          <p className="text-white/20 italic text-sm mb-4 group-hover:text-white/40 transition-colors">
            SVG Render of Active Circuit would be here
          </p>
          <div className="w-64 h-64 border-2 border-dashed border-carbon-grey rounded-full animate-spin duration-[10s] opacity-20"></div>
        </div>

        {/* Race Control */}
        <div className="border border-carbon-grey bg-carbon-grey/30 rounded flex flex-col overflow-hidden h-[500px]">
          <div className="bg-carbon-grey p-4 text-xs font-bold uppercase tracking-widest text-f1-red border-b border-carbon-grey">
            FIA Race Control
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.length > 0 ? messages.map((msg, i) => (
              <div key={i} className="border-l-2 border-f1-red pl-4 py-1 animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-[10px] text-white/30 uppercase mb-1">
                  {new Date(msg.date).toLocaleTimeString()}
                </p>
                <p className="text-xs text-white leading-relaxed">{msg.message}</p>
              </div>
            )) : (
              <p className="text-center text-white/20 py-20 italic text-sm">Waiting for FIA feed...</p>
            )}
          </div>
        </div>

        {/* Leaderboard Placeholder */}
        <div className="lg:col-span-3 border border-carbon-grey bg-carbon-grey/30 rounded p-6 h-64 flex flex-col justify-between overflow-hidden group">
          <div className="flex justify-between items-center">
            <h3 className="text-f1-red font-bold uppercase italic tracking-wider">Live Timing / Leaderboard</h3>
            <span className="text-[10px] text-white/20 font-mono uppercase">Update Frequency: 1.0s</span>
          </div>
          <div className="flex-grow flex items-center justify-center">
             <div className="grid grid-cols-5 gap-8 opacity-20 group-hover:opacity-40 transition-opacity">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-2 w-32 bg-white rounded"></div>
                ))}
             </div>
          </div>
          <p className="text-center text-white/10 text-xs italic">
            Connecting to OpenF1 /intervals stream...
          </p>
        </div>
      </div>
    </div>
  );
}
