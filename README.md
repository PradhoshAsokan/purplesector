# Purple Sector 🏎️💨

Purple Sector is a high-performance, serverless Formula 1 live data aggregator and news platform. It provides fans with real-time race telemetry, news aggregation, and historical data through a sleek, engineer-focused dashboard.

## 🚀 Features
- **The Pit Wall:** Live race data dashboard featuring telemetry, track maps, and FIA messages.
- **The Paddock:** Masonry grid of aggregated F1 news from top sources.
- **Grand Prix Calendar:** Countdown to the next session with automatic timezone conversion.
- **Hall of Fame:** Drivers and Constructors standings with historical statistics.

## 🛠️ Tech Stack
- **Frontend:** [Next.js](https://nextjs.org/) (App Router), React, Tailwind CSS.
- **Backend Proxy:** [Cloudflare Workers](https://workers.cloudflare.com/) (pitwall-proxy).
- **Database/Auth:** [Supabase](https://supabase.com/).
- **Data Sources:** OpenF1 API, Jolpica API, and various RSS feeds.

## 🎨 Design System: "Paddock Dark Mode"
- **Background:** Pitch Black (#000000)
- **Accents:** F1 Signature Red (#FF1801)
- **Cards:** Carbon Fiber Grey (#1F1F1F)

## 🏁 Getting Started
First, install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
