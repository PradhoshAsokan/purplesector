'use client';

import { useEffect, useState } from 'react';

interface Race {
  round: string;
  raceName: string;
  Circuit: {
    circuitName: string;
  };
  date: string;
  time: string;
}

export default function CalendarPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
        const response = await fetch(`${apiUrl}/test/calendar`);
        const result = await response.json();
        
        if (result.status === 'Success') {
          const data = result.data.MRData.RaceTable.Races;
          setRaces(data);
        } else {
          setError('Failed to fetch calendar data');
        }
      } catch (err) {
        setError('Connection to backend failed');
      } finally {
        setLoading(false);
      }
    }

    fetchCalendar();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-f1-red uppercase italic mb-8">Grand Prix Calendar</h1>
      
      <div className="border border-carbon-grey bg-carbon-grey/30 rounded p-8 mb-8 text-center backdrop-blur-sm">
        <p className="text-6xl font-mono tracking-tighter text-white mb-2">LIVE DATA</p>
        <p className="text-sm uppercase tracking-widest text-f1-red">2026 Season Schedule</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-f1-red"></div>
        </div>
      ) : error ? (
        <div className="p-8 border border-red-500/50 bg-red-500/10 rounded text-center text-red-500">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {races.map((race) => (
            <div key={race.round} className="flex justify-between items-center border border-carbon-grey p-6 rounded hover:bg-carbon-grey/20 transition-all hover:border-f1-red/50 group">
              <div>
                <p className="text-f1-red text-xs font-bold uppercase tracking-widest mb-1">Round {race.round}</p>
                <h2 className="text-2xl font-bold text-white italic uppercase group-hover:text-f1-red transition-colors">
                  {race.raceName}
                </h2>
                <p className="text-white/40 text-sm uppercase tracking-wider">{race.Circuit.circuitName}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-mono text-xl">{race.date}</p>
                <p className="text-white/40 text-xs uppercase">{race.time ? race.time.replace('Z', ' UTC') : 'TBC'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
