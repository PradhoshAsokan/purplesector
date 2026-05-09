'use client';

import { useEffect, useState, useMemo } from 'react';

interface Session {
  date: string;
  time: string;
}

interface Race {
  round: string;
  raceName: string;
  Circuit: {
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

export default function CalendarPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [nextSessionInfo, setNextSessionInfo] = useState<string>('');

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
        const response = await fetch(`${apiUrl}/test/calendar`);
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

  // Find next session and update countdown
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
    <div className="p-8 min-h-screen bg-black">
      <h1 className="text-4xl font-bold text-[#FF1801] uppercase italic mb-8 tracking-tighter">Grand Prix Calendar</h1>
      
      {/* Countdown Section */}
      <div className="border border-[#1F1F1F] bg-[#1F1F1F]/20 rounded-xl p-8 mb-12 text-center backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FF1801]/30">
           <div className="h-full bg-[#FF1801] animate-pulse" style={{ width: '40%' }}></div>
        </div>
        <p className="text-7xl font-black tracking-tighter text-white mb-4 tabular-nums">
          {loading ? '00 : 00 : 00 : 00' : timeLeft || 'SEASON ENDED'}
        </p>
        <p className="text-xs uppercase tracking-[0.4em] text-[#FF1801] font-bold">
          {loading ? 'CALCULATING NEXT SESSION...' : nextSessionInfo || 'STAY TUNED FOR 2027'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF1801]"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {races.map((race) => {
             const isExpanded = expandedRound === race.round;
             const raceDate = new Date(`${race.date}T${race.time}`);
             const isPast = raceDate < new Date();

             return (
              <div key={race.round} className={`border border-[#1F1F1F] rounded-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'border-[#FF1801]/50 bg-[#1F1F1F]/30 shadow-2xl' : 'hover:border-white/20 bg-transparent'}`}>
                <button 
                  onClick={() => toggleExpand(race.round)}
                  className={`w-full text-left p-6 flex justify-between items-center group ${isPast ? 'opacity-40' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-black text-white/10 group-hover:text-[#FF1801]/20 transition-colors">
                      {race.round.padStart(2, '0')}
                    </span>
                    <div>
                      <h2 className={`text-2xl font-black italic uppercase transition-colors ${isExpanded ? 'text-[#FF1801]' : 'text-white group-hover:text-[#FF1801]'}`}>
                        {race.raceName}
                      </h2>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">{race.Circuit.Location.locality}, {race.Circuit.Location.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white/80">{new Date(race.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                    <p className="text-[10px] text-[#FF1801] uppercase font-bold">{isPast ? 'COMPLETED' : 'UPCOMING'}</p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-12 pb-8 pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4 border-r border-[#1F1F1F] pr-12">
                      <SessionRow label="Practice 1" session={race.FirstPractice} />
                      {race.SecondPractice && <SessionRow label="Practice 2" session={race.SecondPractice} />}
                      {race.SprintQualifying && <SessionRow label="Sprint Quali" session={race.SprintQualifying} />}
                    </div>
                    <div className="space-y-4">
                      {race.ThirdPractice && <SessionRow label="Practice 3" session={race.ThirdPractice} />}
                      {race.Sprint && <SessionRow label="Sprint Race" session={race.Sprint} />}
                      <SessionRow label="Qualifying" session={race.Qualifying} />
                      <SessionRow label="Main Race" session={{ date: race.date, time: race.time }} isGrandPrix />
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

function SessionRow({ label, session, isGrandPrix }: { label: string, session?: Session, isGrandPrix?: boolean }) {
  if (!session) return null;
  return (
    <div className="flex justify-between items-center group/item">
      <span className={`text-[11px] uppercase tracking-widest font-bold ${isGrandPrix ? 'text-[#FF1801]' : 'text-white/40'}`}>{label}</span>
      <span className="text-xs font-mono text-white/80 group-hover/item:text-[#FF1801] transition-colors">
        {formatLocalTime(session.date, session.time)}
      </span>
    </div>
  );
}
