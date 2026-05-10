import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="border-b border-carbon-grey bg-black py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-f1-red uppercase italic">
          Purple Sector
        </Link>
        
        <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-white/70">
          <Link href="/pit-wall" className="hover:text-f1-red transition-colors cursor-pointer">Pit Wall</Link>
          <Link href="/paddock" className="hover:text-f1-red transition-colors cursor-pointer">Paddock</Link>
          <Link href="/calendar" className="hover:text-f1-red transition-colors cursor-pointer">Calendar</Link>
          <Link href="/standings" className="hover:text-f1-red transition-colors cursor-pointer">Standings</Link>
        </div>
        
        {/* <div className="text-xs font-mono text-f1-red animate-pulse">
          ● LIVE DATA
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
