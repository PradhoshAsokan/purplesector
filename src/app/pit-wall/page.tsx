'use client';

import { useEffect, useState } from 'react';
import CircuitMap from '@/components/CircuitMap';
import { CIRCUITS_METADATA } from '@/data/circuits_metadata';

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
  driver_number: number;
  code: string;
  color: string;
  gap: string;
  position: number;
}

interface CarTelemetry {
  driver_number: number;
  speed: number;
  rpm: number;
  n_gear: number;
  throttle: number;
}

interface Stint {
  driver_number: number;
  compound: string;
  tyre_age: number;
  stops?: number;
}

interface PitStop {
  driver_number: number;
  duration: number | null;
  lap_number: number;
}

interface RadioMessage {
  date: string;
  driver_number: number;
  recording_url: string;
}

// --- Constants ---
const TEAM_COLORS: Record<string, string> = {
  '1': '#FF8000', '3': '#3671C6', '11': '#3671C6', '44': '#E80020', '16': '#E80020',
  '4': '#FF8000', '81': '#FF8000', '63': '#27F4D2', '12': '#27F4D2', '14': '#229971',
  '18': '#229971', '10': '#0093CC', '31': '#0093CC', '43': '#0093CC', '23': '#64C4FF',
  '55': '#64C4FF', '22': '#6692FF', '30': '#6692FF', '41': '#6692FF', '27': '#FFFFFF',
  '5': '#FFFFFF', '20': '#B6BABD', '87': '#B6BABD', '77': '#52E252', '24': '#52E252', '6': '#3671C6',
};

const DRIVER_CODES: Record<string, string> = {
  '1': 'NOR', '3': 'VER', '11': 'PER', '44': 'HAM', '16': 'LEC', '81': 'PIA',
  '63': 'RUS', '12': 'ANT', '14': 'ALO', '18': 'STR', '10': 'GAS', '31': 'OCO',
  '43': 'COL', '23': 'ALB', '55': 'SAI', '22': 'TSU', '30': 'LAW', '41': 'LIN',
  '27': 'HUL', '5': 'BOR', '20': 'MAG', '87': 'BEA', '77': 'BOT', '24': 'ZHO', '6': 'HAD'
};

export default function PitWallPage() {
  const [messages, setMessages] = useState<RaceMessage[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [radio, setRadio] = useState<RadioMessage[]>([]);
  const [stints, setStints] = useState<Stint[]>([]);
  const [pits, setPits] = useState<PitStop[]>([]);
  const [telemetry, setTelemetry] = useState<Record<number, CarTelemetry>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sessionActive, setSessionActive] = useState(true);
  const [circuitId, setCircuitId] = useState<string>('villeneuve');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkSessionAndFetch() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
      try {
        const sessionRes = await fetch("https://api.openf1.org/v1/sessions?session_key=latest");
        const sessionData = await sessionRes.json();
        
        if (Array.isArray(sessionData) && sessionData.length > 0) {
          const latest = sessionData[0];
          const now = new Date();
          const isLive = now >= new Date(latest.date_start) && now <= new Date(latest.date_end);
          
          setCircuitId(latest.circuit_short_name?.toLowerCase().replace(' ', '_') || 'villeneuve');
          
          if (!isLive) {
            setSessionActive(false);
            fetchLive(apiUrl);
            return;
          }
          setSessionActive(true);
        }
      } catch (e) {
        console.log("Session check failed");
      }

      fetchLive(apiUrl);
      interval = setInterval(() => fetchLive(apiUrl), 5000);
    }

    async function fetchLive(apiUrl: string) {
      // 1. Race Control
      fetch(`${apiUrl}/test/race-control`).then(r => r.json()).then(data => {
        if (data.status === 'Success' && Array.isArray(data.data)) {
          setMessages(data.data.slice(-50).reverse());
        }
      }).catch(e => console.log("Race control offline"));

      // 2. Weather
      fetch(`${apiUrl}/test/weather`).then(r => r.json()).then(data => {
        if (data.status === 'Success' && Array.isArray(data.data) && data.data.length > 0) {
          setWeather(data.data[data.data.length - 1]);
        }
      }).catch(e => console.log("Weather offline"));

      // 3. Telemetry
      fetch(`${apiUrl}/test/car_data`).then(r => r.json()).then(telData => {
        if (telData.status === 'Success' && Array.isArray(telData.data)) {
          const telMap: Record<number, CarTelemetry> = {};
          telData.data.forEach((t: CarTelemetry) => { telMap[t.driver_number] = t; });
          setTelemetry(prev => ({ ...prev, ...telMap }));
        }
      }).catch(e => console.log("Car data offline"));

      // 4. Timing
      fetch(`${apiUrl}/test/telemetry`).then(r => r.json()).then(timingData => {
        if (timingData.status === 'Success' && Array.isArray(timingData.data)) {
           const latestMap = new Map();
           timingData.data.forEach((t: any) => { latestMap.set(t.driver_number, t); });
           const processed = Array.from(latestMap.values())
             .sort((a: any, b: any) => (a.interval || 0) - (b.interval || 0))
             .map((t: any, idx: number) => ({
               driver_number: t.driver_number,
               code: DRIVER_CODES[t.driver_number] || `#${t.driver_number}`,
               color: TEAM_COLORS[t.driver_number] || '#FFFFFF',
               gap: t.interval ? `+${t.interval.toFixed(3)}` : 'LEADER',
               position: idx + 1
             }));
           setLeaderboard(processed);
        }
      }).catch(e => console.log("Timing offline"));

      // 5. Radio
      fetch(`${apiUrl}/test/radio`).then(r => r.json()).then(data => {
        if (data.status === 'Success' && Array.isArray(data.data)) {
          setRadio(data.data.slice(-8).reverse());
        }
      }).catch(e => console.log("Radio offline"));

      // 6. Stints
      fetch(`${apiUrl}/test/stints`).then(r => r.json()).then(data => {
        if (data.status === 'Success' && Array.isArray(data.data)) {
          const latestMap = new Map();
          data.data.forEach((s: any) => latestMap.set(s.driver_number, s));
          setStints(Array.from(latestMap.values()));
        }
      }).catch(e => console.log("Stints offline"));

      // 7. Pits
      fetch(`${apiUrl}/test/pits`).then(r => r.json()).then(data => {
        if (data.status === 'Success' && Array.isArray(data.data)) {
          setPits(data.data.slice(-5).reverse());
        }
      }).catch(e => console.log("Pits offline"));
    }

    checkSessionAndFetch();
    return () => { if (interval) clearInterval(interval); };
  }, []);

  const meta = CIRCUITS_METADATA[circuitId] || CIRCUITS_METADATA['villeneuve'];

  const playRadio = (url: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="p-4 bg-black font-mono text-white min-h-screen">
      
      {/* LAYER 1: LIVE CONTROL */}
      <div className="h-[calc(100vh-120px)] flex flex-col mb-8">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-[#FF1801] uppercase italic tracking-tighter">The Pit Wall</h1>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <p className={`text-[9px] uppercase tracking-[0.2em] ${sessionActive ? 'text-green-500 animate-pulse' : 'text-white/40'}`}>
              {sessionActive ? 'Live Stream Active' : 'Post-Race Console'}
            </p>
          </div>
          {weather && (
            <div className="flex gap-4 bg-[#1F1F1F]/60 px-3 py-1.5 rounded-lg border border-[#1F1F1F] backdrop-blur-sm shadow-2xl">
               <StatItem label="Track" value={`${weather.track_temperature}°C`} />
               <StatItem label="Air" value={`${weather.air_temperature}°C`} />
               <StatItem label="Rain" value={weather.rainfall > 0 ? 'YES' : 'NO'} color={weather.rainfall > 0 ? 'text-blue-400' : 'text-[#FF1801]'} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
          {/* Leaderboard */}
          <div className="lg:col-span-3 h-full flex flex-col bg-[#1F1F1F]/20 border border-[#1F1F1F] rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-[#1F1F1F] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#FF1801]">Intervals</div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <table className="w-full text-left text-[10px]">
                <thead className="text-white/20 uppercase border-b border-[#1F1F1F] sticky top-0 bg-black/90 backdrop-blur-md">
                  <tr><th className="px-2 py-2">P</th><th className="px-2 py-2">Code</th><th className="px-2 py-2">Gap</th></tr>
                </thead>
                <tbody className="bg-black/20">
                  {leaderboard.map((d) => (
                    <tr key={d.driver_number} className="border-b border-white/[0.03] hover:bg-white/5 transition-colors h-7">
                      <td className="px-2 py-1 font-bold text-white/40">{d.position}</td>
                      <td className="px-2 py-1 flex items-center gap-1.5">
                        <div className="w-0.5 h-2.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.2)]" style={{ backgroundColor: d.color }}></div>
                        <span className="font-black italic text-sm text-white/90">{d.code}</span>
                      </td>
                      <td className="px-2 py-1 text-[#FF1801] tabular-nums font-bold tracking-tighter">{d.gap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic Circuit Monitor with Metadata */}
          <div className="lg:col-span-6 h-full border border-[#1F1F1F] bg-[#1F1F1F]/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
             <div className="absolute top-3 left-4 text-[8px] font-black text-[#FF1801]/40 uppercase tracking-widest z-10">Circuit Monitor</div>
             
             {/* Metadata Overlays */}
             <div className="absolute top-12 left-4 flex flex-col gap-2 z-10">
                <CircuitStat label="Track Length" value={meta.track_length_km + " km"} />
                <CircuitStat label="Total Laps" value={meta.number_of_laps.toString()} />
                <CircuitStat label="First GP" value={meta.first_grand_prix.toString()} />
             </div>

             <div className="absolute top-12 right-4 flex flex-col items-end gap-2 z-10 text-right">
                <CircuitStat label="Fastest Lap" value={meta.fastest_lap.time} />
                <CircuitStat label="Held By" value={meta.fastest_lap.driver} />
                <CircuitStat label="Year" value={meta.fastest_lap.year.toString()} />
             </div>

             <CircuitMap circuitId={circuitId} className="w-[80%] h-[80%]" showCars={true} />
             
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center z-10">
                <h2 className="text-lg font-black italic uppercase text-white tracking-tighter">{meta.circuit_name}</h2>
                <p className="text-[8px] text-white/30 uppercase tracking-[0.4em]">{meta.location}</p>
             </div>
          </div>

          {/* Race Control */}
          <div className="lg:col-span-3 h-full flex flex-col bg-[#1F1F1F]/20 border border-[#1F1F1F] rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-[#1F1F1F] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#FF1801]">Race Control</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[10px] scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((m, i) => (
                <div key={i} className="border-l-2 border-[#FF1801] pl-3 py-1 bg-white/[0.03] rounded-r-md">
                  <p className="text-white/90 leading-relaxed">{m.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Layer and Telemetry Grid follow... */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 pt-4 border-t border-[#1F1F1F]">
        <div className="lg:col-span-7 bg-[#1F1F1F]/10 border border-[#1F1F1F] rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-[#1F1F1F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FF1801] flex justify-between">
             <span>Tire Strategy & Pit Analysis</span>
             <span className="text-white/20 font-mono">LIVE_DATA_STREAM</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
             <div className="border border-white/5 rounded-lg overflow-hidden bg-black/40">
               <table className="w-full text-left text-[10px]">
                 <thead className="bg-white/5 text-white/40 uppercase font-bold">
                    <tr><th className="p-2">Car</th><th className="p-2">Comp</th><th className="p-2">Age</th></tr>
                 </thead>
                 <tbody>
                   {stints.map((s, i) => (
                     <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="p-2 font-black italic">#{s.driver_number}</td>
                        <td className="p-2">
                           <span className={`px-2 py-0.5 rounded-sm font-bold text-[8px] ${s.compound === 'SOFT' ? 'bg-red-600' : s.compound === 'MEDIUM' ? 'bg-yellow-600' : 'bg-white text-black'}`}>
                             {s.compound}
                           </span>
                        </td>
                        <td className="p-2 text-white/60 tabular-nums">{s.tyre_age} L</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             <div className="border border-white/5 rounded-lg overflow-hidden flex flex-col bg-black/40">
                <div className="bg-white/5 p-2 text-[8px] font-bold uppercase text-white/40 border-b border-white/5">Box Entry Timeline</div>
                <div className="flex-grow p-2 space-y-2 max-h-[160px] overflow-y-auto">
                   {pits.map((p, i) => (
                     <div key={i} className="flex justify-between items-center text-[10px] p-2 bg-white/5 border border-white/5 rounded-md group hover:border-[#FF1801]/40 transition-all">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#FF1801] rounded-full"></div><span className="font-black italic text-xs">#{p.driver_number}</span></div>
                        <div className="flex gap-4 items-center">
                           <span className="text-[#FF1801] font-bold tabular-nums">{p.duration ? p.duration.toFixed(2) : '---'}s</span>
                           <span className="text-white/20 text-[8px] font-bold uppercase">L{p.lap_number || '---'}</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#1F1F1F]/10 border border-[#1F1F1F] rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-[#1F1F1F] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FF1801]">Intercepted Team Radio</div>
          <div className="p-4 space-y-3 h-[300px] overflow-y-auto custom-scrollbar">
             {radio.map((r, i) => (
               <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:border-[#FF1801]/40 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded bg-[#FF1801] flex items-center justify-center text-[10px] font-black italic shadow-lg shadow-[#FF1801]/20">{r.driver_number}</div>
                       <span className="text-[9px] font-bold text-[#FF1801] uppercase tracking-tighter">{DRIVER_CODES[r.driver_number] || 'DVR'} UPLINK</span>
                    </div>
                    <button onClick={() => playRadio(r.recording_url)} className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-[#FF1801] text-white rounded shadow-xl hover:scale-105 transition-transform">Listen</button>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="h-[2px] flex-1 bg-white/5 relative overflow-hidden"><div className="absolute inset-0 bg-[#FF1801]/20 animate-[loading_2s_ease-in-out_infinite]"></div></div>
                     <span className="text-[8px] text-white/20 uppercase tabular-nums">{new Date(r.date).toLocaleTimeString()}</span>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="border border-[#1F1F1F] bg-[#1F1F1F]/10 rounded-xl p-6 shadow-2xl mb-20">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3">
              <h3 className="text-[#FF1801] font-black italic uppercase text-sm tracking-widest">Telemetry grid</h3>
              <div className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[8px] font-bold rounded animate-pulse">CAR_LINK_ACTIVE</div>
           </div>
           <span className="text-[8px] text-white/20 uppercase font-mono tracking-widest">Refresh: 5s</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.keys(DRIVER_CODES).map((num) => {
            const dNum = parseInt(num);
            const data = telemetry[dNum];
            return (
              <div key={num} className="bg-[#1F1F1F]/40 border border-[#1F1F1F] p-3 rounded-lg hover:border-[#FF1801]/50 transition-all group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-base font-black italic text-white/40 group-hover:text-white transition-colors">{DRIVER_CODES[num]}</span>
                  <div className="w-1 h-3 rounded-full" style={{ backgroundColor: TEAM_COLORS[num] }}></div>
                </div>
                <div className="space-y-2">
                  <TelemetryStat label="SPD" value={data?.speed.toString() || '---'} unit="KM/H" />
                  <TelemetryStat label="RPM" value={data?.rpm.toString() || '----'} />
                  <TelemetryStat label="GR" value={data?.n_gear.toString() || '-'} />
                  <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden shadow-inner">
                     <div className="h-full bg-[#FF1801]/60 transition-all duration-700" style={{ width: `${(data?.throttle || 0)}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CircuitStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-black/60 p-2 rounded border border-white/5 backdrop-blur-md min-w-[80px]">
       <p className="text-[7px] uppercase font-bold text-white/30 tracking-widest mb-0.5">{label}</p>
       <p className="text-[10px] font-black text-[#FF1801] uppercase tabular-nums">{value}</p>
    </div>
  );
}

function StatItem({ label, value, color = 'text-white' }: { label: string, value: string, color?: string }) {
  return (
    <div className="text-center px-4 border-r border-white/5 last:border-0">
      <p className="text-[8px] text-white/30 uppercase font-bold mb-1 tracking-widest">{label}</p>
      <p className={`text-sm font-black ${color}`}>{value}</p>
    </div>
  );
}

function TelemetryStat({ label, value, unit }: { label: string, value: string, unit?: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[7px] text-white/30 font-bold uppercase">{label}</span>
      <div className="flex gap-1 items-baseline">
        <span className="text-[10px] font-black tabular-nums">{value}</span>
        {unit && <span className="text-[7px] text-white/20">{unit}</span>}
      </div>
    </div>
  );
}
