import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="border-b border-white/5 bg-carbon/80 backdrop-blur-md py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter text-f1-red uppercase italic hover:scale-105 transition-transform">
          Purple Sector
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-silver/60">
          <Link href="/pit-wall" className="hover:text-f1-red transition-all">Pit Wall</Link>
          <Link href="/paddock" className="hover:text-f1-red transition-all">Paddock</Link>
          <Link href="/calendar" className="hover:text-f1-red transition-all">Calendar</Link>
          <Link href="/standings" className="hover:text-f1-red transition-all">Standings</Link>
        </div>

        {/* Mobile Navigation Placeholder / Compact View */}
        <div className="md:hidden">
           <button className="text-[10px] font-black text-silver bg-steel px-3 py-1 rounded uppercase tracking-widest border border-white/5 active:scale-95 transition-all">
             Menu
           </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
