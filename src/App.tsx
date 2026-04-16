import { BrowserRouter, Routes, Route, NavLink } from "react-router";
import { TunerPage } from "./pages/TunerPage";
import { FingeringPage } from "./pages/FingeringPage";
import { PianoPage } from "./pages/PianoPage";
import { MetronomePage } from "./pages/MetronomePage";
import { EarTrainingPage } from "./pages/EarTrainingPage";
import { ScalePracticePage } from "./pages/ScalePracticePage";
import { MetronomeWidget } from "./components/MetronomeWidget";
import { useMetronome } from "./hooks/useMetronome";

const NAV_ITEMS = [
  {
    to: "/",
    end: true,
    label: "Tuner",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="12" x2="12" y2="6" />
        <line x1="12" y1="12" x2="16" y2="14" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: "/fingerings",
    label: "Fingerings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: "/piano",
    label: "Piano",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="7" y1="5" x2="7" y2="14" />
        <line x1="12" y1="5" x2="12" y2="14" />
        <line x1="17" y1="5" x2="17" y2="14" />
        <rect x="4.5" y="5" width="2.5" height="8" rx="1" fill="currentColor" stroke="none" />
        <rect x="9.5" y="5" width="2.5" height="8" rx="1" fill="currentColor" stroke="none" />
        <rect x="14.5" y="5" width="2.5" height="8" rx="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: "/ear-training",
    label: "Ear Training",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 18h2a7 7 0 0 1 14 0h2" />
        <circle cx="12" cy="10" r="4" />
        <line x1="12" y1="2" x2="12" y2="6" />
      </svg>
    ),
  },
  {
    to: "/metronome",
    label: "Metronome",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M6 22L12 2l6 20" />
        <path d="M8 16h8" />
        <line x1="12" y1="8" x2="17" y2="5" />
      </svg>
    ),
  },
  {
    to: "/scales",
    label: "Scales",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 18l3-6 3 4 3-8 3 5 3-9 3 14" />
      </svg>
    ),
  },
];


function AppShell() {
  const metronome = useMetronome();

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      {/* Sidebar */}
      <nav className="w-16 bg-bg-secondary border-r border-border flex flex-col items-center py-4 gap-1 shrink-0">
        {/* Logo */}
        <div className="mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M9 3v9a3 3 0 1 0 6 0V3" />
            <path d="M6 3h12" />
          </svg>
        </div>

        <div className="w-8 border-t border-border mb-1" />

        {NAV_ITEMS.map(({ to, end, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              [
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                isActive
                  ? "bg-accent-blue text-white"
                  : "text-text-muted hover:bg-bg-elevated hover:text-text-primary",
              ].join(" ")
            }
          >
            {icon}
          </NavLink>
        ))}

        {/* Metronome widget — always visible at bottom of sidebar */}
        <MetronomeWidget
          state={metronome.state}
          onToggle={metronome.toggle}
          onTap={metronome.tapTempo}
        />
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<TunerPage />} />
          <Route path="/fingerings" element={<FingeringPage />} />
          <Route path="/piano" element={<PianoPage />} />
          <Route path="/ear-training" element={<EarTrainingPage />} />
          <Route path="/metronome" element={<MetronomePage />} />
          <Route path="/scales" element={<ScalePracticePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
