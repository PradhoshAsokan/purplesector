'use client';

import { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  link: string;
  date: string;
  image?: string;
}

export default function PaddockPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          setError("API configuration missing");
          return;
        }
        const response = await fetch(`${apiUrl}/v1/news`);
        const result = await response.json();
        
        if (result.status === 'Success') {
          setNews(result.data);
        } else {
          setError('Failed to fetch news feed');
        }
      } catch (err) {
        setError('Connection to backend failed');
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-asphalt">
      <h1 className="text-4xl font-black text-f1-red uppercase italic mb-8 tracking-tighter">The Paddock</h1>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-f1-red"></div>
        </div>
      ) : error ? (
        <div className="p-8 border border-red-500/50 bg-red-500/10 rounded text-center text-red-500 font-mono text-xs uppercase tracking-widest">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {news.map((item, index) => (
            <a 
              key={index} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group border border-white/5 bg-carbon rounded-xl flex flex-col overflow-hidden hover:border-f1-red/50 hover:bg-steel/30 transition-all shadow-2xl h-full min-h-[400px]"
            >
              {/* News Image */}
              <div className="relative h-48 w-full bg-steel overflow-hidden">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-carbon">
                    <span className="text-f1-red font-black italic opacity-20 text-4xl uppercase tracking-tighter">Purple Sector</span>
                  </div>
                )}
                <div className="absolute top-0 left-0 w-full h-1 bg-f1-red transition-all group-hover:h-2"></div>
              </div>

              {/* News Content */}
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <h2 className="text-xl font-black text-smoke-white mb-4 italic uppercase leading-tight group-hover:text-f1-red transition-colors line-clamp-3">
                    {item.title}
                  </h2>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono mt-auto pt-4 border-t border-white/5">
                  <span className="text-silver/40 uppercase tracking-widest font-bold">{item.date}</span>
                  <span className="text-f1-red font-black group-hover:translate-x-1 transition-transform uppercase tracking-tighter">Read Article →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-[10px] text-silver/20 uppercase tracking-[0.5em] text-center font-bold">
        Real-time F1 News Aggregator
      </div>
    </div>
  );
}
