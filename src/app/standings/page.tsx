'use client';

import { useEffect, useState } from 'react';

interface DriverStanding {
  position: string;
  points: string;
  Driver: {
    driverId: string;
    givenName: string;
    familyName: string;
    code: string;
    permanentNumber: string;
  };
  Constructors: {
    constructorId: string;
    name: string;
  }[];
}

interface ConstructorStanding {
  position: string;
  points: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
}

const TEAM_COLORS: Record<string, string> = {
  mercedes: '#27F4D2',
  red_bull: '#3671C6',
  ferrari: '#E80020',
  mclaren: '#FF8000',
  aston_martin: '#229971',
  alpine: '#0093CC',
  williams: '#64C4FF',
  rb: '#6692FF',
  haas: '#B6BABD',
  sauber: '#52E252',
  audi: '#FFFFFF',
  cadillac: '#FFD700',
};

export default function StandingsPage() {
  const [view, setView] = useState<'drivers' | 'constructors'>('drivers');
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          setError("API configuration missing");
          return;
        }
        const endpoint = view === 'drivers' ? '/v1/standings' : '/v1/constructors';
        
        console.log(`Fetching ${view} from:`, `${apiUrl}${endpoint}`);
        const response = await fetch(`${apiUrl}${endpoint}`);
        const result = await response.json();
        
        if (result.status === 'Success') {
          const standingsList = result.data.MRData.StandingsTable.StandingsLists[0];
          if (view === 'drivers') {
            setDriverStandings(standingsList.DriverStandings);
          } else {
            setConstructorStandings(standingsList.ConstructorStandings);
          }
        } else {
          setError(`Failed to fetch ${view} data`);
        }
      } catch (err) {
        setError('Connection to backend failed');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [view]);

  return (
    <div className="p-8 min-h-screen bg-black">
      <h1 className="text-4xl font-bold text-[#FF1801] uppercase italic mb-8 tracking-tighter">Hall of Fame</h1>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setView('drivers')}
          className={`px-6 py-2 font-bold uppercase italic rounded text-xs tracking-widest transition-all ${
            view === 'drivers' ? 'bg-[#FF1801] text-white shadow-lg shadow-[#FF1801]/20' : 'border border-[#1F1F1F] text-white/40 hover:bg-[#1F1F1F]'
          }`}
        >
          Drivers
        </button>
        <button 
          onClick={() => setView('constructors')}
          className={`px-6 py-2 font-bold uppercase italic rounded text-xs tracking-widest transition-all ${
            view === 'constructors' ? 'bg-[#FF1801] text-white shadow-lg shadow-[#FF1801]/20' : 'border border-[#1F1F1F] text-white/40 hover:bg-[#1F1F1F]'
          }`}
        >
          Constructors
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF1801]"></div>
        </div>
      ) : error ? (
        <div className="p-8 border border-red-500/50 bg-red-500/10 rounded text-center text-red-500">
          {error}
        </div>
      ) : (
        <div className="border border-[#1F1F1F] rounded-xl overflow-hidden bg-[#1F1F1F]/10 backdrop-blur-md">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-[#1F1F1F] text-white/50 uppercase italic text-[10px] tracking-widest">
              <tr>
                <th className="p-4">Pos</th>
                <th className="p-4">{view === 'drivers' ? 'Driver' : 'Constructor'}</th>
                {view === 'drivers' && <th className="p-4">Team</th>}
                <th className="p-4 text-right">Pts</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {view === 'drivers' ? (
                driverStandings.map((item) => {
                  const teamId = item.Constructors[0]?.constructorId;
                  const teamColor = TEAM_COLORS[teamId] || '#FFFFFF';
                  
                  return (
                    <tr key={item.Driver.driverId} className="border-t border-[#1F1F1F] hover:bg-white/5 transition-colors group relative overflow-hidden">
                      <td className="p-4 w-12">
                        <span className="text-lg font-bold italic group-hover:text-[#FF1801] transition-colors relative z-10">
                          {item.position}
                        </span>
                      </td>
                      <td className="p-4 relative">
                        <div className="flex items-center gap-4 relative z-10">
                          <div 
                            className="w-1 h-8 rounded-full shadow-lg" 
                            style={{ backgroundColor: teamColor, boxShadow: `0 0 10px ${teamColor}44` }}
                          ></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 uppercase tracking-tighter">
                              {item.Driver.givenName}
                            </span>
                            <span className="text-base font-bold text-white uppercase italic tracking-tighter leading-none">
                              {item.Driver.familyName}
                            </span>
                          </div>
                          {/* Visibility Fix: Brighter ghost number with low opacity */}
                          <span className="ml-auto text-4xl font-black text-white/40 italic absolute right-4 transition-opacity group-hover:text-white/50">
                            {item.Driver.permanentNumber}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 relative z-10">
                        <span className="uppercase text-[10px] font-bold tracking-widest px-2 py-1 bg-white/5 rounded border border-white/10">
                          {item.Constructors[0]?.name}
                        </span>
                      </td>
                      <td className="p-4 text-right relative z-10">
                        <span className="text-xl font-bold text-[#FF1801] tabular-nums">
                          {item.points}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                constructorStandings.map((item) => {
                  const teamColor = TEAM_COLORS[item.Constructor.constructorId] || '#FFFFFF';
                  return (
                    <tr key={item.Constructor.constructorId} className="border-t border-[#1F1F1F] hover:bg-white/5 transition-colors group">
                      <td className="p-4 w-12">
                        <span className="text-lg font-bold italic group-hover:text-[#FF1801] transition-colors">
                          {item.position}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-1 h-8 rounded-full shadow-lg" 
                            style={{ backgroundColor: teamColor, boxShadow: `0 0 10px ${teamColor}44` }}
                          ></div>
                          <span className="text-base font-bold text-white uppercase italic tracking-tighter">
                            {item.Constructor.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-xl font-bold text-[#FF1801] tabular-nums">
                          {item.points}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Visibility Fix: Brighter footer text */}
      <div className="mt-8 text-[10px] text-white/60 uppercase tracking-[0.5em] text-center font-bold">
        Official 2026 Season {view === 'drivers' ? 'Driver' : 'Constructor'} Standings
      </div>
    </div>
  );
}
