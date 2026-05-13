'use client';

import { useEffect, useState } from 'react';
import CircuitMap from '@/components/CircuitMap';

interface Session {
  date: string;
  time: string;
}

interface Race {
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
  time: string;
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  Qualifying?: Session;
  Sprint?: Session;
  SprintQualifying?: Session;
}

const COUNTRY_TO_ISO: Record<string, string> = {
  'Australia': 'au',
  'China': 'cn',
  'Japan': 'jp',
  'USA': 'us',
  'Canada': 'ca',
  'Monaco': 'mc',
  'Spain': 'es',
  'Austria': 'at',
  'UK': 'gb',
  'Belgium': 'be',
  'Hungary': 'hu',
  'Netherlands': 'nl',
  'Italy': 'it',
  'Azerbaijan': 'az',
  'Singapore': 'sg',
  'Mexico': 'mx',
  'Brazil': 'br',
  'Qatar': 'qa',
  'UAE': 'ae',
  'Saudi Arabia': 'sa',
  'Bahrain': 'bh'
};

const formatLocalTime = (dateStr: string, timeStr: string) => {
  const fullIso = `${dateStr}T${timeStr}`;
  const date = new Date(fullIso);
  return date.toLocaleString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

function SessionRow({ label, session, isGrandPrix }: { label: string, session?: Session, isGrandPrix?: boolean }) {
  if (!session) return null;
  return (
    <div className="flex justify-between items-center group/item">
      <span className={`text-[11px] uppercase tracking-widest font-bold ${isGrandPrix ? 'text-[#FF1801]' : 'text-white/40'}`}>{label}</span>
      <span className="text-xs font-mono text-white/80 group-hover/item:text-[#FF1801] transition-colors tabular-nums">
        {formatLocalTime(session.date, session.time)}
      </span>
    </div>
  );
}

export default function CalendarPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [nextSessionInfo, setNextSessionInfo] = useState<string>('');

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          setLoading(false);
          return;
        }
        const response = await fetch(`${apiUrl}/v1/calendar`);
        const result = await response.json();
        if (result.status === 'Success') {
          setRaces(result.data.MRData.RaceTable.Races);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, []);

  useEffect(() => {
    if (races.length === 0) return;

    const updateCountdown = () => {
      const now = new Date();
      let closestSession: Date | null = null;
      let sessionLabel = '';

      for (const race of races) {
        const sessions = [
          { date: race.date, time: race.time, label: `${race.raceName} - Main Race` },
          { date: race.Qualifying?.date, time: race.Qualifying?.time, label: `${race.raceName} - Qualifying` },
          { date: race.FirstPractice?.date, time: race.FirstPractice?.time, label: `${race.raceName} - FP1` },
          { date: race.SecondPractice?.date, time: race.SecondPractice?.time, label: `${race.raceName} - FP2` },
          { date: race.ThirdPractice?.date, time: race.ThirdPractice?.time, label: `${race.raceName} - FP3` },
          { date: race.Sprint?.date, time: race.Sprint?.time, label: `${race.raceName} - Sprint Race` },
          { date: race.SprintQualifying?.date, time: race.SprintQualifying?.time, label: `${race.raceName} - Sprint Quali` },
        ];

        for (const s of sessions) {
          if (!s.date || !s.time) continue;
          const sTime = new Date(`${s.date}T${s.time}`);
          if (sTime > now) {
            if (!closestSession || sTime < closestSession) {
              closestSession = sTime;
              sessionLabel = s.label;
            }
          }
        }
      }

      if (closestSession) {
        const diff = closestSession.getTime() - now.getTime();
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        
        setTimeLeft(`${d}D : ${h.toString().padStart(2, '0')}H : ${m.toString().padStart(2, '0')}M : ${s.toString().padStart(2, '0')}S`);
        setNextSessionInfo(sessionLabel);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [races]);

  const toggleExpand = (round: string) => {
    setExpandedRound(expandedRound === round ? null : round);
  };

  return (
    <div className="p-8 min-h-screen bg-asphalt text-smoke-white font-mono">
      <h1 className="text-4xl font-black text-f1-red uppercase italic mb-8 tracking-tighter text-center lg:text-left">Grand Prix Calendar</h1>
      
      <div className="border border-white/5 bg-carbon rounded-xl p-8 mb-12 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-f1-red/20">
           <div className="h-full bg-f1-red animate-pulse" style={{ width: '40%' }}></div>
        </div>
        <p className="text-5xl md:text-7xl font-black tracking-tighter text-smoke-white mb-4 tabular-nums">
          {loading ? '00 : 00 : 00 : 00' : timeLeft || 'SEASON ENDED'}
        </p>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-f1-red font-black">
          {loading ? 'CALCULATING NEXT SESSION...' : nextSessionInfo || 'STAY TUNED FOR 2027'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-f1-red"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {races.map((race) => {
             const isExpanded = expandedRound === race.round;
             const raceDate = new Date(`${race.date}T${race.time}`);
             const isPast = raceDate < new Date();
             const isoCode = COUNTRY_TO_ISO[race.Circuit.Location.country] || 'un';

             return (
              <div key={race.round} className={`border border-white/5 rounded-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'border-f1-red/50 bg-carbon shadow-2xl scale-[1.02]' : 'hover:border-white/20 bg-carbon/40'}`}>
                <button 
                  onClick={() => toggleExpand(race.round)}
                  className={`w-full text-left p-4 md:p-6 flex justify-between items-center group ${isPast ? 'opacity-30' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <span className="text-xl md:text-2xl font-black text-silver/40 group-hover:text-f1-red transition-colors w-6 md:w-8">
                      {race.round.padStart(2, '0')}
                    </span>
                    <img 
                      src={`https://flagcdn.com/w40/${isoCode}.png`} 
                      alt={race.Circuit.Location.country}
                      className="w-6 md:w-8 h-auto shadow-lg border border-white/10"
                    />
                    <div className="min-w-0">
                      <h2 className={`text-lg md:text-2xl font-black italic uppercase transition-colors truncate ${isExpanded ? 'text-f1-red' : 'text-smoke-white group-hover:text-f1-red'}`}>
                        {race.raceName}
                      </h2>
                      <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-silver/40 font-black truncate">
                        {race.Circuit.circuitName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm md:text-lg font-black text-smoke-white/80 tabular-nums">
                      {new Date(race.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[8px] md:text-[10px] text-f1-red uppercase font-black">{isPast ? 'COMPLETED' : 'UPCOMING'}</p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 md:px-12 pb-8 pt-2 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4 lg:border-r border-white/5 lg:pr-8">
                      <SessionRow label="Practice 1" session={race.FirstPractice} />
                      {race.SecondPractice && <SessionRow label="Practice 2" session={race.SecondPractice} />}
                      {race.SprintQualifying && <SessionRow label="Sprint Quali" session={race.SprintQualifying} />}
                    </div>
                    <div className="space-y-4 lg:border-r border-white/5 lg:pr-8">
                      {race.ThirdPractice && <SessionRow label="Practice 3" session={race.ThirdPractice} />}
                      {race.Sprint && <SessionRow label="Sprint Race" session={race.Sprint} />}
                      <SessionRow label="Qualifying" session={race.Qualifying} />
                      <SessionRow label="Main Race" session={{ date: race.date, time: race.time }} isGrandPrix />
                    </div>
                    <div className="flex flex-col items-center justify-center bg-asphalt/60 rounded-lg p-4 border border-white/5 group/map relative overflow-hidden h-40">
                       <CircuitMap circuitId={race.Circuit.circuitId} className="w-full h-full" color="white" />
                       <span className="text-[8px] font-black text-silver/20 uppercase italic tracking-widest mt-2">
                          Circuit Configuration
                       </span>
                    </div>
                  </div>
                )}
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
}
