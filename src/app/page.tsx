import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-8 bg-black text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-12 text-center">
        <h1 className="text-8xl font-bold tracking-tighter text-[#FF1801] uppercase italic">
          Purple Sector
        </h1>
        
        <div className="max-w-2xl p-8 border border-[#1F1F1F] bg-[#1F1F1F]/20 rounded-lg backdrop-blur-sm">
          <p className="text-xl mb-6 text-white/80">
            The ultimate Formula 1 live telemetry and news aggregator for the modern fan.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/pit-wall" className="p-4 border border-[#1F1F1F] hover:border-[#FF1801] hover:bg-[#FF1801]/10 transition-all group rounded-lg">
              <span className="block text-[#FF1801] font-bold uppercase mb-1">Pit Wall</span>
              <span className="text-xs text-white/40 group-hover:text-white/60">Live Race Dashboard</span>
            </Link>
            <Link href="/paddock" className="p-4 border border-[#1F1F1F] hover:border-[#FF1801] hover:bg-[#FF1801]/10 transition-all group rounded-lg">
              <span className="block text-[#FF1801] font-bold uppercase mb-1">Paddock</span>
              <span className="text-xs text-white/40 group-hover:text-white/60">News Aggregator</span>
            </Link>
            <Link href="/calendar" className="p-4 border border-[#1F1F1F] hover:border-[#FF1801] hover:bg-[#FF1801]/10 transition-all group rounded-lg">
              <span className="block text-[#FF1801] font-bold uppercase mb-1">Calendar</span>
              <span className="text-xs text-white/40 group-hover:text-white/60">Session Countdowns</span>
            </Link>
            <Link href="/standings" className="p-4 border border-[#1F1F1F] hover:border-[#FF1801] hover:bg-[#FF1801]/10 transition-all group rounded-lg">
              <span className="block text-[#FF1801] font-bold uppercase mb-1">Standings</span>
              <span className="text-xs text-white/40 group-hover:text-white/60">Season Hall of Fame</span>
            </Link>
          </div>
        </div>

        <div className="text-xs text-white/20 uppercase tracking-[0.5em] mt-8">
          Powered by OpenF1 & Jolpica
        </div>
      </div>
    </main>
  );
}
