export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-6xl font-bold tracking-tighter text-f1-red uppercase italic">
          Purple Sector
        </h1>
        <div className="p-8 border border-carbon-grey bg-carbon-grey/50 rounded-lg text-center">
          <p className="text-xl">Welcome to the Paddock. Live telemetry coming soon.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-f1-red text-white font-bold rounded shadow-lg shadow-f1-red/20">
            PIT WALL
          </div>
          <div className="px-4 py-2 border border-carbon-grey hover:bg-carbon-grey transition-colors rounded">
            THE PADDOCK
          </div>
        </div>
      </div>
    </main>
  );
}
