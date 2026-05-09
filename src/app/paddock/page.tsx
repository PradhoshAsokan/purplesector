'use client';

import { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  link: string;
  date: string;
}

export default function PaddockPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
        console.log('Fetching news from:', `${apiUrl}/test/news`);
        const response = await fetch(`${apiUrl}/test/news`);
        const result = await response.json();
        console.log('News result:', result);
        
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
    <div className="p-8 min-h-screen bg-black">
      <h1 className="text-4xl font-bold text-[#FF1801] uppercase italic mb-8">The Paddock</h1>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF1801]"></div>
        </div>
      ) : error ? (
        <div className="p-8 border border-red-500/50 bg-red-500/10 rounded text-center text-red-500">
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
              className="group border border-[#1F1F1F] bg-[#1F1F1F]/30 rounded-lg p-6 flex flex-col justify-between hover:border-[#FF1801]/50 hover:bg-[#1F1F1F]/50 transition-all shadow-xl h-80"
            >
              <div>
                <div className="h-1 w-12 bg-[#FF1801] mb-6 transition-all group-hover:w-full"></div>
                <h2 className="text-xl font-bold text-white mb-4 italic uppercase leading-tight group-hover:text-[#FF1801] transition-colors line-clamp-4">
                  {item.title}
                </h2>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white/40 uppercase tracking-widest">{item.date}</span>
                <span className="text-[#FF1801] font-bold">READ MORE →</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
