# SaxTutor (Alto) — Implementation Plan

A Tauri v2 desktop app for learning alto saxophone: tuner, fingering charts, keyboard, ear training, metronome, and scale practice.

## Tech Stack

- **Tauri v2** — native desktop shell (Rust backend, webview frontend)
- **React 18+ / TypeScript (strict)** — UI framework
- **Tailwind CSS v4** — styling, dark theme (`#1a1a2e` base)
- **React Router** — page navigation
- **Web Audio API** — pitch detection, synthesis, metronome
- **pnpm** — package manager

## Project Structure

```
src/
  main.tsx                        # React entry
  App.tsx                         # Router + Layout
  index.css                       # Tailwind + theme

  audio/
    AudioEngine.ts                # Singleton AudioContext manager
    PitchDetector.ts              # YIN algorithm pitch detection
    Synthesizer.ts                # Piano synthesis (multi-harmonic + ADSR)
    MetronomeEngine.ts            # Lookahead-scheduled click engine

  data/
    notes.ts                      # Note names, NoteInfo type
    transposition.ts              # Alto sax Eb: written-9 = concert
    fingerings.ts                 # All 33 notes Bb3–F#6, alternate fingerings
    scales.ts                     # 14 scale definitions with degree names
    chords.ts                     # Chord patterns + interval names
    keyboardMapping.ts            # Computer keys → MIDI

  hooks/
    usePitchDetection.ts          # Mic → YIN → concert + written NoteInfo
    useAudioEngine.ts             # Shared AudioContext access
    useMetronome.ts               # Metronome state (persists across routes)
    useLocalStorage.ts            # Typed localStorage persistence
    useKeyboardPiano.ts           # Keyboard → noteOn/noteOff

  components/
    Layout.tsx                    # Sidebar nav + main content area
    Sidebar.tsx                   # Navigation links + metronome widget
    NoteDisplay.tsx               # Concert + written pitch, color-coded
    CentsMeter.tsx                # Horizontal cents bar (−50 to +50)
    PitchHistory.tsx              # Canvas rolling line chart (~5s)
    Piano.tsx                     # Reusable keyboard (configurable range)
    PianoKey.tsx                  # Single key (white/black)
    FingeringChart.tsx            # Wrapper: note → pressed keys → diagram
    FingeringDiagram.tsx          # SVG saxophone key schematic
    MetronomeWidget.tsx           # Compact sidebar metronome
    ScaleSelector.tsx             # Root + scale type dropdowns

  pages/
    TunerPage.tsx
    FingeringPage.tsx
    PianoPage.tsx
    EarTrainingPage.tsx
    MetronomePage.tsx
    ScalePracticePage.tsx

  utils/
    musicTheory.ts                # freq ↔ MIDI ↔ note conversions
    pitchMath.ts                  # Cents calculations

src-tauri/
  tauri.conf.json                 # Window: 1200×800, min 900×600, title "SaxTutor"
  src/main.rs, lib.rs             # Minimal Rust entry point
```

## Branches & Phases

Each phase gets its own branch off `main`, merged via PR when complete.

---

### Phase 0 — `setup/scaffold` — Environment & Project Scaffold

- [ ] Install Rust via `rustup` (prerequisite for Tauri)
- [ ] Scaffold Tauri v2 project: `pnpm create tauri-app` (react-ts template)
- [ ] Install dependencies: `react-router`, `tailwindcss`, `@tailwindcss/vite`
- [ ] Configure Vite: add Tailwind plugin
- [ ] Configure Tailwind theme: dark palette custom colors
- [ ] Configure Tauri window: size, title, min dimensions
- [ ] Remove old HTML files (piano.html, tuner.html)
- [ ] Verify: `pnpm tauri dev` opens a window

---

### Phase 1 — `feature/core-foundation` — Data Layer + Audio Engine + App Shell

**Data layer** (`src/data/`, `src/utils/`):
- [ ] `notes.ts` — note name arrays, NoteInfo type
- [ ] `transposition.ts` — `concertToWritten(+9)`, `writtenToConcert(-9)`, range constants
- [ ] `scales.ts` — 14 scales with intervals + degree names
- [ ] `chords.ts` — 11 chord types, interval name array
- [ ] `keyboardMapping.ts` — Z-M → C3-B3, Q-I → C4-C5
- [ ] `musicTheory.ts` — midiToFrequency, frequencyToMidi, frequencyToNoteInfo

**Audio engine** (`src/audio/`):
- [ ] `AudioEngine.ts` — singleton, lazy AudioContext, mic stream request
- [ ] `PitchDetector.ts` — YIN algorithm, bufferSize 4096, confidence score
- [ ] `Synthesizer.ts` — multi-harmonic sines, ADSR, key-click noise
- [ ] `MetronomeEngine.ts` — setInterval(25ms) + scheduleAhead(100ms), accent/beat/sub timbres

**App shell**:
- [ ] `Layout.tsx` + `Sidebar.tsx` — fixed sidebar with nav icons, main content area
- [ ] `App.tsx` — BrowserRouter, 6 routes
- [ ] `index.css` — Tailwind import, `@theme` block with dark palette

**Hooks**:
- [ ] `usePitchDetection` — mic → analyser → YIN → NoteInfo + history buffer
- [ ] `useMetronome` — wraps engine, React state, persists across route changes
- [ ] `useKeyboardPiano` — keydown/keyup → callbacks, repeat prevention
- [ ] `useLocalStorage` — generic typed persistence

---

### Phase 2 — `feature/tuner` — Tuner Module

- [ ] `NoteDisplay` — large written note + concert pitch label, green/yellow/red by cents
- [ ] `CentsMeter` — horizontal bar, center line, color fill by deviation
- [ ] `PitchHistory` — canvas, ring buffer of ~300 points, rolling line chart
- [ ] `TunerPage` — assembles: NoteDisplay + CentsMeter + PitchHistory + FingeringChart + Start/Stop
- [ ] Frequency readout, silence handling (idle after 300ms)

**Verify:** 440Hz → A4 concert / F#5 written, 0 cents, green. 445Hz → +19 cents, yellow.

---

### Phase 3 — `feature/fingering-chart` — Fingering Chart Module

- [ ] `FingeringDiagram.tsx` — hand-coded SVG, ~20 keys (circles for tone holes, rects for side/palm/pinky), `pressedKeys` prop
- [ ] `fingerings.ts` — all 33 chromatic notes Bb3–F#6 (written), alternate fingerings (e.g. Bb4: bis, side, 1-3)
- [ ] `FingeringChart.tsx` — note lookup → key set → diagram
- [ ] `FingeringPage` — note grid selector, large diagram, alternate tabs, prev/next, optional live tuner link

**Verify:** Every note has data. Bb4 shows 3 alternates. Live tuner link updates diagram.

---

### Phase 4 — `feature/piano` — Piano/Keyboard Module

- [ ] `Piano.tsx` — reusable, absolute-positioned keys, props: range, activeNotes, scaleHighlight, callbacks
- [ ] `PianoKey.tsx` — white/black, active/highlighted states, degree badge
- [ ] `PianoPage` — Piano + ScaleSelector + chord/interval detection + volume + keyboard guide
- [ ] Synthesizer integration via shared AudioEngine

**Verify:** Click plays sound. Keyboard shortcuts work. C Major highlights 7 keys. C+E+G → "C Major".

---

### Phase 5 — `feature/metronome` — Metronome Module

- [ ] `MetronomePage` — BPM display (editable), slider 30–300, tap tempo, time sig, subdivisions, visual beat dots
- [ ] `MetronomeWidget` — compact sidebar version: BPM + play/pause + tap
- [ ] `useMetronome` hook integration — state persists across pages

**Verify:** 60 BPM accurate. 3/4 accents beat 1. Subdivisions work. Persists across navigation.

---

### Phase 6 — `feature/ear-training` — Ear Training Module

- [ ] Interval recognition — play 2 notes, identify interval, multiple choice
- [ ] Note identification — play 1 note, name it or play it on sax
- [ ] Chord quality — play chord, identify type
- [ ] 5 difficulty levels (start: P4/P5/octave → add all intervals)
- [ ] Mic answer mode — play answer on sax, app detects it
- [ ] Scoring — accuracy %, streak, best streak, localStorage persistence

**Verify:** Correct answers score. Scores persist across sessions. Mic mode works.

---

### Phase 7 — `feature/scale-practice` — Scale Practice Module

- [ ] Scale browser — root + type selector, piano + fingering chart dual display
- [ ] Play-along — sequential note highlighting, tuner detects correct → advance
- [ ] Long tone exercises — stability meter (% in-tune time), cents deviation graph
- [ ] Tempo integration with metronome

**Verify:** Play-along advances on correct note. Long tone stability tracks accurately.

---

## Key Technical Notes

### Transposition (Alto Sax, Eb)
```
concert MIDI = written MIDI − 9
written MIDI = concert MIDI + 9
```
- Written range: Bb3 (MIDI 58) to F#6 (MIDI 90)
- Concert range: Db3 (MIDI 49) to A5 (MIDI 81)
- Fingering chart always indexed by **written** note
- Tuner detects **concert** pitch from frequency, derives written

### YIN Pitch Detection
Buffer size 4096 at 44.1kHz — reliable down to ~100Hz (sax low Bb concert ≈ 130Hz). Cumulative mean normalized difference handles sax harmonics better than basic autocorrelation.

### Metronome Scheduling
`setInterval(25ms)` lookahead + `scheduleAhead(100ms)` via AudioContext clock. Audio events are sample-accurate. Visual beat updates via React state callback.

### Audio Architecture
Single shared `AudioContext`:
```
AudioContext (singleton)
├── MediaStreamSource (mic) → AnalyserNode (pitch detection only, no output)
├── Synthesizer → GainNode → destination
└── Metronome → GainNode → destination
```

### Fingering SVG
Schematic diagram (not realistic). Portrait layout:
- Top: octave key, palm keys (D, Eb, F), front F
- Middle-top: LH1, LH2, LH3 (large circles), bis key
- Divider: pinky table (G#, C#, B, Bb)
- Middle-bottom: side keys (E, C, Bb), RH1, RH2, RH3
- Bottom: low Eb, low C, high F#
- Active keys: `#4a90d9` (accent blue) with glow. Inactive: `#2d2d4e`.
