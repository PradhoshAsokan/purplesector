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
  interval: string;
  position: number;
}

interface SessionResult {
  position: number | null;
  driver_number: number;
  points: number;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
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
  const [results, setResults] = useState<SessionResult[]>([]);
  const [sessionActive, setSessionActive] = useState(true);
  const [circuitId, setCircuitId] = useState<string>('villeneuve');
  const [sessionName, setSessionName] = useState<string>('Grand Prix');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkSessionAndFetch() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error("API URL not configured");
        return;
      }
      try {
        const sessionRes = await fetch("https://api.openf1.org/v1/sessions?session_key=latest");
        const sessionData = await sessionRes.json();
        
        if (Array.isArray(sessionData) && sessionData.length > 0) {
          const latest = sessionData[0];
          const now = new Date();
          const isLive = now >= new Date(latest.date_start) && now <= new Date(latest.date_end);
          
          setCircuitId(latest.circuit_short_name?.toLowerCase().replace(' ', '_') || 'villeneuve');
          setSessionName(latest.session_name || 'Grand Prix');
          
          if (!isLive) {
            setSessionActive(false);
            fetchSummary(apiUrl);
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

    async function fetchSummary(apiUrl: string) {
       setLoading(true);
       try {
         const response = await fetch(`${apiUrl}/v1/session_results`);
         const data = await response.json();
         if (data.status === 'Success' && Array.isArray(data.data)) {
           const sorted = data.data.sort((a: any, b: any) => {
              if (a.position === null && b.position !== null) return 1;
              if (a.position !== null && b.position === null) return -1;
              if (a.position === null && b.position === null) return 0;
              return a.position - b.position;
           });
           setResults(sorted);
         }
       } finally {
         setLoading(false);
       }
    }

    async function fetchLive(apiUrl: string) {
      // 1. Race Control
      fetch(`${apiUrl}/v1/race-control`).then(r => r.json()).then(data => {
        if (data.status === 'Success' && Array.isArray(data.data)) setMessages(data.data.slice(-50).reverse());
      });

      // 2. Weather
      fetch(`${apiUrl}/v1/weather`).then(r => r.json()).then(data => {
        if (data.status === 'Success' && Array.isArray(data.data) && data.data.length > 0) setWeather(data.data[data.data.length - 1]);
      });

      // 3. Telemetry
      fetch(`${apiUrl}/v1/car_data`).then(r => r.json()).then(telData => {
        if (telData.status === 'Success' && Array.isArray(telData.data)) {
          const telMap: Record<number, CarTelemetry> = {};
          telData.data.forEach((t: CarTelemetry) => { telMap[t.driver_number] = t; });
          setTelemetry(prev => ({ ...prev, ...telMap }));
        }
      });

      // 4. Advanced Timing
      Promise.all([
        fetch(`${apiUrl}/v1/positions`).then(r => r.json()),
        fetch(`${apiUrl}/v1/telemetry`).then(r => r.json())
      ]).then(([posRes, intRes]) => {
        if (posRes.status === 'Success' && intRes.status === 'Success' && Array.isArray(posRes.data) && Array.isArray(intRes.data)) {
           const posMap = new Map();
           [...posRes.data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(p => posMap.set(p.driver_number, p.position));
           const intMap = new Map();
           [...intRes.data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(i => intMap.set(i.driver_number, i));

           const merged = Array.from(posMap.keys()).map(dNum => {
              const gapData = intMap.get(dNum);
              return {
                 driver_number: dNum,
                 code: DRIVER_CODES[dNum] || `#${dNum}`,
                 color: TEAM_COLORS[dNum] || '#FFFFFF',
                 position: posMap.get(dNum),
                 gap: gapData ? (typeof gapData.gap_to_leader === 'number' ? `+${gapData.gap_to_leader.toFixed(3)}` : gapData.gap_to_leader) : 'SYNC',
                 interval: gapData ? (gapData.interval ? `+${gapData.interval.toFixed(3)}` : '-') : '-'
              };
           }).sort((a, b) => a.position - b.position);
           if (merged.length > 0) merged[0].gap = 'LEADER';
           setLeaderboard(merged);
        }
      });

      // 5. Radio / Stints / Pits
      fetch(`${apiUrl}/v1/radio`).then(r => r.json()).then(data => { if (data.status === 'Success' && Array.isArray(data.data)) setRadio(data.data.slice(-8).reverse()); });
      fetch(`${apiUrl}/v1/stints`).then(r => r.json()).then(data => { if (data.status === 'Success' && Array.isArray(data.data)) { const latestMap = new Map(); data.data.forEach((s: any) => latestMap.set(s.driver_number, s)); setStints(Array.from(latestMap.values())); } });
      fetch(`${apiUrl}/v1/pits`).then(r => r.json()).then(data => { if (data.status === 'Success' && Array.isArray(data.data)) setPits(data.data.slice(-5).reverse()); });
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

  // --- RENDERING LOGIC ---

  if (!sessionActive) {
     return (
        <div className="p-8 bg-asphalt font-mono text-smoke-white min-h-screen">
           <div className="max-w-6xl mx-auto">
              <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-8">
                 <div>
                    <h1 className="text-6xl font-black text-f1-red uppercase italic tracking-tighter">Session Summary</h1>
                    <p className="text-xl text-silver/40 uppercase tracking-widest">{sessionName} — {meta.circuit_name}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-silver/20 uppercase tracking-[0.3em] mb-1">Status</p>
                    <span className="px-4 py-1 bg-white/5 border border-white/5 rounded-full text-smoke-white font-bold text-sm uppercase">Off-Track</span>
                 </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 {/* Left: Final Classification */}
                 <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-f1-red font-black italic uppercase tracking-widest text-sm underline decoration-2 underline-offset-8 mb-8">Final Classification</h3>
                    <div className="bg-carbon border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                       <table className="w-full text-left">
                          <thead className="bg-steel/50 text-silver/60 text-[10px] uppercase font-bold tracking-widest">
                             <tr><th className="p-4">Pos</th><th className="p-4">Driver</th><th className="p-4">Status</th><th className="p-4 text-right">Points</th></tr>
                          </thead>
                          <tbody>
                             {results.map((r) => (
                                <tr key={r.driver_number} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                   <td className="p-4 text-2xl font-black italic text-silver/20">{r.position}</td>
                                   <td className="p-4">
                                      <div className="flex items-center gap-4">
                                         <div className="w-1 h-8 rounded-full shadow-glow" style={{ backgroundColor: TEAM_COLORS[r.driver_number] }}></div>
                                         <div>
                                            <p className="text-xl font-black uppercase italic leading-none text-smoke-white tracking-tighter">
                                               {DRIVER_CODES[r.driver_number] || 'DVR'}
                                            </p>
                                            <p className="text-[10px] text-silver/40 font-bold mt-1 tracking-widest">
                                               #{r.driver_number}
                                            </p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="p-4 text-xs font-bold uppercase">
                                      {r.dsq ? <span className="text-f1-red">DSQ</span> : 
                                       r.dnf ? <span className="text-silver/40">DNF</span> : 
                                       r.dns ? <span className="text-silver/20">DNS</span> : 
                                       <span className="text-green-500/60 text-[8px]">Finished</span>}
                                   </td>
                                   <td className="p-4 text-right text-2xl font-black text-f1-red tabular-nums">{r.points}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 {/* Right: Track & Next Session */}
                 <div className="space-y-8">
                    <div className="bg-carbon border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                       <h4 className="text-[10px] font-black text-f1-red uppercase tracking-widest mb-6">Track Specs</h4>
                       <div className="h-48 mb-6">
                          <CircuitMap circuitId={circuitId} color="red" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <CircuitStat label="Laps" value={meta.number_of_laps.toString()} />
                          <CircuitStat label="Distance" value={meta.track_length_km * meta.number_of_laps + " km"} />
                       </div>
                    </div>

                    <div className="bg-f1-red rounded-2xl p-8 shadow-[0_0_50px_rgba(255,24,1,0.2)]">
                       <h4 className="text-[10px] font-black text-black uppercase tracking-widest mb-4">Next Event</h4>
                       <p className="text-3xl font-black text-black italic uppercase leading-none mb-2">CANADIAN GP</p>
                       <p className="text-black/60 text-xs font-bold uppercase tracking-widest mb-8">Montreal — May 24</p>
                       <div className="text-4xl font-black text-smoke-white tracking-tighter italic">LIVE IN 12 DAYS</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="p-4 bg-asphalt font-mono text-smoke-white min-h-screen overflow-x-hidden">
      
      {/* LAYER 1: LIVE CONTROL */}
      <div className="h-[calc(100vh-120px)] flex flex-col mb-8">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-f1-red uppercase italic tracking-tighter text-glow">The Pit Wall</h1>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <p className={`text-[9px] uppercase tracking-[0.2em] ${sessionActive ? 'text-green-500 animate-pulse' : 'text-silver/40'}`}>
              {sessionActive ? 'Live Stream Active' : 'Post-Race Console'}
            </p>
          </div>
          {weather && (
            <div className="flex gap-4 bg-carbon/60 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm shadow-2xl">
               <StatItem label="Track" value={`${weather.track_temperature}°C`} />
               <StatItem label="Air" value={`${weather.air_temperature}°C`} />
               <StatItem label="Rain" value={weather.rainfall > 0 ? 'YES' : 'NO'} color={weather.rainfall > 0 ? 'text-blue-400' : 'text-f1-red'} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
          {/* Leaderboard */}
          <div className="lg:col-span-3 h-full flex flex-col bg-carbon border border-white/5 rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-steel px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-f1-red">Timing / Gaps</div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <table className="w-full text-left text-[10px]">
                <thead className="text-silver/20 uppercase border-b border-white/5 sticky top-0 bg-asphalt/90 backdrop-blur-md">
                  <tr><th className="px-2 py-2">P</th><th className="px-2 py-2">Code</th><th className="px-2 py-2 text-right">Gap</th><th className="px-2 py-2 text-right">Int</th></tr>
                </thead>
                <tbody className="bg-black/20">
                  {leaderboard.map((d) => (
                    <tr key={d.driver_number} className="border-b border-white/[0.03] hover:bg-white/5 transition-colors h-7">
                      <td className="px-2 py-1 font-bold text-silver/40">{d.position}</td>
                      <td className="px-2 py-1 flex items-center gap-1.5">
                        <div className="w-0.5 h-2.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.2)]" style={{ backgroundColor: d.color }}></div>
                        <span className="font-black italic text-sm text-smoke-white/90">{d.code}</span>
                      </td>
                      <td className="px-2 py-1 text-f1-red tabular-nums font-bold tracking-tighter text-right">{d.gap}</td>
                      <td className="px-2 py-1 text-silver/30 tabular-nums text-[9px] text-right">{d.interval}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Circuit Monitor */}
          <div className="lg:col-span-6 h-full border border-white/5 bg-carbon/40 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
             <div className="absolute top-3 left-4 text-[8px] font-black text-f1-red/40 uppercase tracking-widest z-10">Circuit Monitor</div>
             <div className="absolute top-12 left-4 flex flex-col gap-2 z-10"><CircuitStat label="Track Length" value={meta.track_length_km + " km"} /><CircuitStat label="Total Laps" value={meta.number_of_laps.toString()} /><CircuitStat label="First GP" value={meta.first_grand_prix.toString()} /></div>
             <div className="absolute top-12 right-4 flex flex-col items-end gap-2 z-10 text-right"><CircuitStat label="Fastest Lap" value={meta.fastest_lap.time} /><CircuitStat label="Held By" value={meta.fastest_lap.driver} /><CircuitStat label="Year" value={meta.fastest_lap.year.toString()} /></div>
             <CircuitMap circuitId={circuitId} className="w-[80%] h-[80%]" showCars={true} />
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center z-10 w-full px-4"><h2 className="text-xl font-black italic uppercase text-smoke-white tracking-tighter drop-shadow-lg">{meta.circuit_name}</h2><p className="text-[8px] text-silver/40 uppercase tracking-[0.4em] font-bold">{meta.location}</p></div>
          </div>

          {/* Race Control */}
          <div className="lg:col-span-3 h-full flex flex-col bg-carbon border border-white/5 rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-steel px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-f1-red">Race Control</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[10px] scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((m, i) => (
                <div key={i} className="border-l-2 border-f1-red pl-3 py-1 bg-white/[0.03] rounded-r-md"><p className="text-smoke-white/90 leading-relaxed">{m.message}</p></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 2: ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 pt-4 border-t border-white/5">
        <div className="lg:col-span-7 bg-carbon border border-white/5 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-steel px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-f1-red flex justify-between"><span>Tire Strategy & Pit Analysis</span><span className="text-silver/20 font-mono uppercase text-[8px]">Link_Active</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
             <div className="border border-white/5 rounded-lg overflow-hidden bg-asphalt/40">
               <table className="w-full text-left text-[10px]">
                 <thead className="bg-white/5 text-silver/40 uppercase font-bold"><tr><th className="p-2">Car</th><th className="p-2">Comp</th><th className="p-2">Age</th></tr></thead>
                 <tbody>{stints.map((s, i) => (<tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]"><td className="p-2 font-black italic">#{s.driver_number}</td><td className="p-2 text-center"><span className={`px-3 py-0.5 rounded-sm font-bold text-[8px] ${s.compound === 'SOFT' ? 'bg-red-600 text-smoke-white' : s.compound === 'MEDIUM' ? 'bg-yellow-600 text-smoke-white' : 'bg-smoke-white text-black'}`}>{s.compound}</span></td><td className="p-2 text-silver/60 tabular-nums">{s.tyre_age} L</td></tr>))}</tbody>
               </table>
             </div>
             <div className="border border-white/5 rounded-lg overflow-hidden flex flex-col bg-asphalt/40">
                <div className="bg-white/5 p-2 text-[8px] font-bold uppercase text-silver/40 border-b border-white/5 text-center">Box Entry Timeline</div>
                <div className="flex-grow p-2 space-y-2 max-h-[160px] overflow-y-auto">{pits.map((p, i) => (<div key={i} className="flex justify-between items-center text-[10px] p-2 bg-white/5 border border-white/5 rounded-md group hover:border-f1-red/40 transition-all"><div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-f1-red rounded-full"></div><span className="font-black italic text-xs">#{p.driver_number}</span></div><div className="flex gap-4 items-center"><span className="text-f1-red font-bold tabular-nums">{p.duration ? p.duration.toFixed(2) : '---'}s</span><span className="text-silver/20 text-[8px] font-bold uppercase">L{p.lap_number || '---'}</span></div></div>))}</div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-carbon border border-white/5 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-steel px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-f1-red">Intercepted Team Radio</div>
          <div className="p-4 space-y-3 h-[300px] overflow-y-auto custom-scrollbar">{radio.map((r, i) => (<div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:border-f1-red/40 transition-all group"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-f1-red flex items-center justify-center text-[10px] font-black italic shadow-lg shadow-f1-red/20">{r.driver_number}</div><span className="text-[9px] font-bold text-f1-red uppercase tracking-tighter">{DRIVER_CODES[r.driver_number] || 'DVR'} UPLINK</span></div><button onClick={() => playRadio(r.recording_url)} className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-f1-red text-smoke-white rounded shadow-xl hover:scale-105 active:scale-95 transition-all">Listen</button></div><div className="flex items-center gap-4"><div className="h-[2px] flex-1 bg-white/5 relative overflow-hidden"><div className="absolute inset-0 bg-f1-red/20 animate-[loading_2s_ease-in-out_infinite]"></div></div><span className="text-[8px] text-silver/20 uppercase tabular-nums">{new Date(r.date).toLocaleTimeString()}</span></div></div>))}</div>
        </div>
      </div>

      {/* LAYER 3: TELEMETRY */}
      <div className="border border-white/5 bg-carbon border border-white/5 rounded-xl p-6 shadow-2xl mb-20">
        <div className="flex justify-between items-center mb-6 px-2"><div className="flex items-center gap-3"><h3 className="text-f1-red font-black italic uppercase text-sm tracking-widest">Telemetry grid</h3><div className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[8px] font-bold rounded animate-pulse uppercase">Link_Active</div></div><span className="text-[8px] text-silver/20 uppercase font-mono tracking-widest">Global Hz: 2.7</span></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">{Object.keys(DRIVER_CODES).map((num) => { const dNum = parseInt(num); const data = telemetry[dNum]; return (<div key={num} className="bg-asphalt/40 border border-white/5 p-3 rounded-lg hover:border-f1-red/50 transition-all group"><div className="flex justify-between items-center mb-3"><span className="text-base font-black italic text-silver/40 group-hover:text-smoke-white transition-colors">{DRIVER_CODES[num]}</span><div className="w-1 h-3 rounded-full shadow-lg" style={{ backgroundColor: TEAM_COLORS[num] }}></div></div><div className="space-y-2"><TelemetryStat label="SPD" value={data?.speed.toString() || '---'} unit="KM/H" /><TelemetryStat label="RPM" value={data?.rpm.toString() || '----'} /><TelemetryStat label="GR" value={data?.n_gear.toString() || '-'} /><div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden shadow-inner"><div className="h-full bg-f1-red/60 transition-all duration-700" style={{ width: `${(data?.throttle || 0)}%` }}></div></div></div></div>); })}</div>
      </div>
    </div>
  );
}

function CircuitStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-asphalt/60 p-2 rounded border border-white/5 backdrop-blur-md min-w-[85px] shadow-lg">
       <p className="text-[7px] uppercase font-bold text-silver/30 tracking-widest mb-0.5">{label}</p>
       <p className="text-[10px] font-black text-f1-red uppercase tabular-nums">{value}</p>
    </div>
  );
}

function StatItem({ label, value, color = 'text-smoke-white' }: { label: string, value: string, color?: string }) {
  return (
    <div className="text-center px-4 border-r border-white/5 last:border-0">
      <p className="text-[8px] text-silver/30 uppercase font-bold mb-1 tracking-widest">{label}</p>
      <p className={`text-sm font-black ${color}`}>{value}</p>
    </div>
  );
}

function TelemetryStat({ label, value, unit }: { label: string, value: string, unit?: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[7px] text-silver/30 font-bold uppercase">{label}</span>
      <div className="flex gap-1 items-baseline">
        <span className="text-[10px] font-black tabular-nums text-smoke-white">{value}</span>
        {unit && <span className="text-[7px] text-silver/20">{unit}</span>}
      </div>
    </div>
  );
}
