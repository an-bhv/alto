import { BrowserRouter, Routes, Route } from "react-router";

function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <h2 className="text-2xl text-text-secondary">{name}</h2>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-bg-primary text-text-primary">
        <nav className="w-16 bg-bg-secondary border-r border-border flex flex-col items-center py-4 gap-2">
          <a href="/" className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors" title="Tuner">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </a>
          <a href="/fingerings" className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors" title="Fingerings">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M7 4v16M12 4v16M17 4v16" />
            </svg>
          </a>
          <a href="/piano" className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors" title="Piano">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M8 4v10M12 4v10M16 4v10" />
            </svg>
          </a>
          <a href="/ear-training" className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors" title="Ear Training">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </a>
          <a href="/metronome" className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors" title="Metronome">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2L8 22h8L12 2z" />
              <path d="M12 8l5-3" />
            </svg>
          </a>
          <a href="/scales" className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors" title="Scale Practice">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M3 17l4-4 4 4 4-8 4 4" />
            </svg>
          </a>
        </nav>

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Placeholder name="Tuner" />} />
            <Route path="/fingerings" element={<Placeholder name="Fingering Chart" />} />
            <Route path="/piano" element={<Placeholder name="Piano" />} />
            <Route path="/ear-training" element={<Placeholder name="Ear Training" />} />
            <Route path="/metronome" element={<Placeholder name="Metronome" />} />
            <Route path="/scales" element={<Placeholder name="Scale Practice" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
