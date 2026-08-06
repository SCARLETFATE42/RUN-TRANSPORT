interface MainContentProps {
  step: "idle" | "selecting" | "active";
  eta: number;
}

export default function MainContent({ step, eta }: MainContentProps) {
  return (
    <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative overflow-hidden">
          {/* Map */}
          <div className="map-container absolute inset-0">
            <div className="map-overlay absolute inset-0" />
            {/* Simulated map UI */}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 600" fill="none">
              <line x1="0" y1="150" x2="800" y2="150" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="4 8" />
              <line x1="0" y1="300" x2="800" y2="300" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 8" />
              <line x1="0" y1="450" x2="800" y2="450" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="4 8" />
              <line x1="150" y1="0" x2="150" y2="600" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 8" />
              <line x1="350" y1="0" x2="350" y2="600" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="4 8" />
              <line x1="550" y1="0" x2="550" y2="600" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="4 8" />
              <rect x="180" y="80" width="120" height="80" rx="4" stroke="var(--color-primary)" strokeWidth="1" fill="rgba(29,78,216,0.05)" />
              <rect x="380" y="200" width="100" height="70" rx="4" stroke="var(--color-primary)" strokeWidth="1" fill="rgba(29,78,216,0.05)" />
              <rect x="200" y="320" width="80" height="60" rx="4" stroke="#60a5fa" strokeWidth="1" fill="rgba(96,165,250,0.05)" />
              <rect x="420" y="350" width="110" height="90" rx="4" stroke="var(--color-primary)" strokeWidth="1" fill="rgba(29,78,216,0.05)" />
              <path d="M150 300 Q280 260 350 300 Q420 340 550 300" stroke="var(--color-primary)" strokeWidth="2.5" fill="none" />
            </svg>

            {/* Vehicle dots on map */}
            <div className="absolute" style={{ top: '38%', left: '42%' }}>
              <div className="relative">
                <div className="absolute inset-0 w-5 h-5 rounded-full pulse-ring" style={{ background: 'rgba(29,78,216,0.3)' }} />
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs vehicle-dot" style={{ background: 'var(--color-primary)', boxShadow: '0 0 12px rgba(29,78,216,0.6)' }}>🚌</div>
              </div>
            </div>
            <div className="absolute" style={{ top: '52%', left: '28%' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--color-green)', boxShadow: '0 0 10px rgba(34,197,94,0.5)' }}>🚗</div>
            </div>
            <div className="absolute" style={{ top: '30%', left: '62%' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--color-amber)', boxShadow: '0 0 10px rgba(251,191,36,0.5)' }}>🚐</div>
            </div>

            {/* Location labels */}
            <div className="absolute px-2 py-1 rounded-md text-xs font-medium" style={{ top: '22%', left: '24%', background: 'rgba(12,21,38,0.85)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              Main Dormitory
            </div>
            <div className="absolute px-2 py-1 rounded-md text-xs font-medium" style={{ top: '47%', left: '48%', background: 'rgba(12,21,38,0.85)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              Academic Block
            </div>
            <div className="absolute px-2 py-1 rounded-md text-xs font-medium" style={{ top: '65%', left: '62%', background: 'rgba(12,21,38,0.85)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
              Sports Complex
            </div>
          </div>

          {/* Active ride overlay */}
          {step === 'active' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 slide-up">
              <div className="px-4 py-3 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(12,21,38,0.92)', border: '1px solid rgba(34,197,94,0.3)', backdropFilter: 'blur(16px)' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-green)', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
                <span className="text-sm font-medium text-white">Ride in progress</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--color-green)' }}>ETA {eta} min</span>
              </div>
            </div>
          )}
        </div>
    </main>

  );
}
