'use client';

import { useEffect, useState } from 'react';
import CircuitMap from '@/components/CircuitMap';

// --- Types ---
interface RaceMessage {
  date: string;
  message: string;
}

interface Weather {
  track_temperature: number;
  air_temperature: number;
  rainfall: number;
}

interface LeaderboardEntry {
  position: number;
  driver_number: number;
  name: string;
  team: string;
  color: string;
  gap: string;
  interval: string;
  last_lap: string;
}

interface RadioMessage {
  date: string;
  driver_number: number;
  recording_url: string;
}

// --- Mock Data for Simulation ---
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { position: 1, driver_number: 1, name: 'VERSTAPPEN', team: 'Red Bull', color: '#3671C6', gap: 'LEADER', interval: '-', last_lap: '1:16.452' },
  { position: 2, driver_number: 4, name: 'NORRIS', team: 'McLaren', color: '#FF8000', gap: '+2.451', interval: '+2.451', last_lap: '1:16.612' },
  { position: 3, driver_number: 16, name: 'LECLERC', team: 'Ferrari', color: '#E80020', gap: '+10.823', interval: '+8.372', last_lap: '1:16.890' },
  { position: 4, driver_number: 81, name: 'PIASTRI', team: 'McLaren', color: '#FF8000', gap: '+15.210', interval: '+4.387', last_lap: '1:17.102' },
  { position: 5, driver_number: 44, name: 'HAMILTON', team: 'Mercedes', color: '#27F4D2', gap: '+22.450', interval: '+7.240', last_lap: '1:16.950' },
];

function StatItem({ label, value, color = 'text-white' }: { label: string, value: string, color?: string }) {
  return (
    <div className="text-center px-4 border-r border-[#1F1F1F] last:border-0">
      <p className="text-[8px] text-white/30 uppercase font-bold mb-1 tracking-widest">{label}</p>
      <p className={`text-sm font-black ${color}`}>{value}</p>
    </div>
  );
}

function TelemetryStat({ label, value, unit }: { label: string, value: string, unit?: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[8px] text-white/30 font-bold uppercase">{label}</span>
      <div className="flex gap-1 items-baseline">
        <span className="text-xs font-black tabular-nums">{value}</span>
        {unit && <span className="text-[7px] text-white/20">{unit}</span>}
      </div>
    </div>
  );
}

export default function PitWallPage() {
  const [messages, setMessages] = useState<RaceMessage[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [radio, setRadio] = useState<RadioMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPitWallData() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
      try {
        const [msgRes, weatherRes, radioRes] = await Promise.all([
          fetch(`${apiUrl}/test/race-control`),
          fetch(`${apiUrl}/test/weather`),
          fetch(`${apiUrl}/test/radio`)
        ]);

        const msgData = await msgRes.json();
        const weatherData = await weatherRes.json();
        const radioData = await radioRes.json();

        if (msgData.status === 'Success') setMessages(msgData.data.slice(-15).reverse());
        if (weatherData.status === 'Success' && weatherData.data.length > 0) {
          setWeather(weatherData.data[weatherData.data.length - 1]);
        }
        if (radioData.status === 'Success') setRadio(radioData.data.slice(0, 5));
      } catch (err) {
        console.error("Data fetch error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPitWallData();
    const interval = setInterval(fetchPitWallData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-black font-mono text-white">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#FF1801] uppercase italic tracking-tighter">The Pit Wall</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Live Race Telemetry Console</p>
        </div>
        
        {weather && (
          <div className="flex gap-4 bg-[#1F1F1F]/40 p-3 rounded-lg border border-[#1F1F1F] backdrop-blur-sm">
             <StatItem label="Track" value={`${weather.track_temperature}°C`} />
             <StatItem label="Air" value={`${weather.air_temperature}°C`} />
             <StatItem label="Rain" value={weather.rainfall > 0 ? 'YES' : 'NO'} color={weather.rainfall > 0 ? 'text-blue-400' : 'text-[#FF1801]'} />
          </div>
        )}
      </div>

      {/* Main Dashboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left: Leaderboard (4 cols) */}
        <div className="lg:col-span-4 order-1 lg:order-1 flex flex-col bg-[#1F1F1F]/20 border border-[#1F1F1F] rounded-xl overflow-hidden">
          <div className="bg-[#1F1F1F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FF1801]">Live Timing</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-white/30 uppercase border-b border-[#1F1F1F]">
                <tr>
                  <th className="p-3">Pos</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Gap</th>
                  <th className="p-3 text-right">Last</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LEADERBOARD.map((d) => (
                  <tr key={d.driver_number} className="border-b border-[#1F1F1F]/50 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold">{d.position}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                        <span className="font-black italic">{d.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-white/60">{d.gap}</td>
                    <td className="p-3 text-right tabular-nums">{d.last_lap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Middle: Track Map (5 cols) */}
        <div className="lg:col-span-5 order-2 lg:order-2 h-[400px] lg:h-auto border border-[#1F1F1F] bg-[#1F1F1F]/10 rounded-xl flex flex-col items-center justify-center relative group overflow-hidden">
           <div className="absolute top-4 left-4 text-[9px] font-black text-[#FF1801]/60 uppercase tracking-widest z-10">Circuit Monitor</div>
           <CircuitMap circuitId="villeneuve" showCars={true} />
        </div>

        {/* Right: Race Control (3 cols) */}
        <div className="lg:col-span-3 order-3 lg:order-3 flex flex-col h-[400px] lg:h-auto border border-[#1F1F1F] bg-[#1F1F1F]/20 rounded-xl overflow-hidden">
          <div className="bg-[#1F1F1F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FF1801]">Race Control</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[10px]">
            {messages.map((m, i) => (
              <div key={i} className="border-l border-[#FF1801] pl-3 py-1 bg-white/5 rounded-r">
                <p className="text-white leading-relaxed">{m.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Sections: Stints and Radio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Stints/Pits */}
        <div className="border border-[#1F1F1F] bg-[#1F1F1F]/20 rounded-xl overflow-hidden">
          <div className="bg-[#1F1F1F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FF1801]">Tire Strategy & Pit Stops</div>
          <div className="p-8 text-center text-white/20 text-xs italic">
            Connecting to Stint Stream...
          </div>
        </div>

        {/* Team Radio */}
        <div className="border border-[#1F1F1F] bg-[#1F1F1F]/20 rounded-xl overflow-hidden">
          <div className="bg-[#1F1F1F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FF1801]">Team Radio Feed</div>
          <div className="p-4 space-y-3">
             {radio.map((r, i) => (
               <div key={i} className="flex items-center justify-between p-2 bg-white/5 border border-white/5 rounded hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#FF1801] flex items-center justify-center text-[10px] font-black italic">
                      {r.driver_number}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-white/60">Recording Available</span>
                  </div>
                  <button className="text-[9px] text-[#FF1801] font-bold border border-[#FF1801]/30 px-2 py-1 rounded">PLAY</button>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Bottom: Car Telemetry Grid */}
      <div className="border border-[#1F1F1F] bg-[#1F1F1F]/10 rounded-xl p-6">
        <h3 className="text-[#FF1801] font-black italic uppercase text-xs mb-6 tracking-widest">Multi-Car Telemetry Grid</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 4, 16, 81, 44, 63, 11, 55, 14, 10].map((num) => (
            <div key={num} className="bg-[#1F1F1F]/40 border border-[#1F1F1F] p-4 rounded-lg group hover:border-[#FF1801]/50 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-black italic text-white/40 group-hover:text-white transition-colors">{num}</span>
                <span className="text-[9px] text-[#FF1801] font-bold">LIVE</span>
              </div>
              <div className="space-y-1">
                <TelemetryStat label="SPD" value="---" unit="KM/H" />
                <TelemetryStat label="RPM" value="----" />
                <TelemetryStat label="GR" value="-" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
