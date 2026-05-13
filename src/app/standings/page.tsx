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
    <div className="p-8 min-h-screen bg-asphalt">
      <h1 className="text-4xl font-black text-f1-red uppercase italic mb-8 tracking-tighter">Hall of Fame</h1>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setView('drivers')}
          className={`px-6 py-2 font-black uppercase italic rounded text-[10px] tracking-widest transition-all active:scale-95 ${
            view === 'drivers' ? 'bg-f1-red text-smoke-white shadow-lg shadow-f1-red/20' : 'bg-steel/50 border border-white/5 text-silver/40 hover:text-smoke-white hover:bg-steel'
          }`}
        >
          Drivers
        </button>
        <button 
          onClick={() => setView('constructors')}
          className={`px-6 py-2 font-black uppercase italic rounded text-[10px] tracking-widest transition-all active:scale-95 ${
            view === 'constructors' ? 'bg-f1-red text-smoke-white shadow-lg shadow-f1-red/20' : 'bg-steel/50 border border-white/5 text-silver/40 hover:text-smoke-white hover:bg-steel'
          }`}
        >
          Constructors
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-f1-red"></div>
        </div>
      ) : error ? (
        <div className="p-8 border border-red-500/50 bg-red-500/10 rounded text-center text-red-500 font-mono text-xs uppercase tracking-widest">
          {error}
        </div>
      ) : (
        <div className="border border-white/5 rounded-xl overflow-hidden bg-carbon shadow-2xl">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-steel/50 text-silver/60 uppercase italic text-[10px] tracking-widest">
              <tr>
                <th className="p-4">Pos</th>
                <th className="p-4">{view === 'drivers' ? 'Driver' : 'Constructor'}</th>
                {view === 'drivers' && <th className="p-4">Team</th>}
                <th className="p-4 text-right">Pts</th>
              </tr>
            </thead>
            <tbody className="text-smoke-white/80">
              {view === 'drivers' ? (
                driverStandings.map((item) => {
                  const teamId = item.Constructors[0]?.constructorId;
                  const teamColor = TEAM_COLORS[teamId] || '#FFFFFF';
                  
                  return (
                    <tr key={item.Driver.driverId} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
                      <td className="p-4 w-12">
                        <span className="text-lg font-black italic group-hover:text-f1-red transition-colors relative z-10">
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
                            <span className="text-[10px] text-silver/40 uppercase tracking-tighter font-bold">
                              {item.Driver.givenName}
                            </span>
                            <span className="text-base font-black text-smoke-white uppercase italic tracking-tighter leading-none">
                              {item.Driver.familyName}
                            </span>
                          </div>
                          <span className="ml-auto text-4xl font-black text-white/[0.07] italic absolute right-4 transition-all group-hover:text-white/[0.15]">
                            {item.Driver.permanentNumber}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 relative z-10">
                        <span className="uppercase text-[10px] font-black tracking-widest px-2 py-1 bg-white/5 rounded border border-white/10 text-silver/80">
                          {item.Constructors[0]?.name}
                        </span>
                      </td>
                      <td className="p-4 text-right relative z-10">
                        <span className="text-xl font-black text-f1-red tabular-nums">
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
                    <tr key={item.Constructor.constructorId} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 w-12">
                        <span className="text-lg font-black italic group-hover:text-f1-red transition-colors">
                          {item.position}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-1 h-8 rounded-full shadow-lg" 
                            style={{ backgroundColor: teamColor, boxShadow: `0 0 10px ${teamColor}44` }}
                          ></div>
                          <span className="text-base font-black text-smoke-white uppercase italic tracking-tighter">
                            {item.Constructor.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-xl font-black text-f1-red tabular-nums">
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
      
      <div className="mt-8 text-[10px] text-silver/60 uppercase tracking-[0.5em] text-center font-bold">
        Official 2026 Season {view === 'drivers' ? 'Driver' : 'Constructor'} Standings
      </div>
    </div>
  );
}
