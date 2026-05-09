# Purple Sector 🏎️💨

Purple Sector is a professional, high-performance Formula 1 live data platform. It provides fans with real-time race telemetry, news aggregation, and localized schedules through an engineer-focused "Paddock Dark Mode" dashboard.

## 🚀 Features

### 📡 The Pit Wall
- **Live Mode:** Real-time Intervals, Team Radio (Audio), Weather, and 22-car Telemetry Grid.
- **Summary Mode:** Automated post-race classification, points recap, and track metadata.
- **Circuit Monitor:** High-contrast SVG track layouts with auto-switching based on active sessions.

### 📰 The Paddock
- **Smart Aggregator:** Exclusive F1 news feed (Autosport) with MotoGP/FE filtering.
- **Rich Media:** High-resolution news thumbnails with smooth UI transitions.

### 📅 GP Calendar
- **Local Time:** All sessions (FP1, Quali, Sprint, Race) converted to your browser's timezone.
- **Weekend Breakdown:** Expandable race rows showing the full 3-day schedule.

### 🏆 Hall of Fame
- **Identity:** Hierarchical driver display with large codes and team brand colors.
- **Sorting:** Advanced logic for Constructors and Drivers with non-finisher handling.

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router), React 19, Tailwind CSS 4.
- **Deployment:** Cloudflare Pages (Frontend) & Cloudflare Workers (Proxy).
- **Database:** Supabase (Auth & Preferences).

## 🏁 Getting Started
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the live console.
