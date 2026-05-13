'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const PathTracker = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <div className="bg-asphalt/50 border-b border-white/5 py-2 px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Link href="/" className="text-wine-red hover:text-f1-red transition-colors font-bold">PS</Link>
        {pathSegments.length > 0 && (
          pathSegments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-white/10">/</span>
              <span className={index === pathSegments.length - 1 ? "text-silver font-bold" : "text-white/40"}>
                {segment.replace(/-/g, ' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PathTracker;
