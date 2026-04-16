import { useState, useRef, useEffect } from "react";
import { Piano } from "../components/Piano";
import { FingeringChart } from "../components/FingeringChart";
import { ScaleSelector } from "../components/ScaleSelector";
import { usePitchDetection } from "../hooks/usePitchDetection";
import { SCALES } from "../data/scales";
import { concertToWritten } from "../data/transposition";
import { midiToNoteName, midiToOctave, noteLabel } from "../data/notes";

// ── Scale note sequence builder ───────────────────────────────────────────────

function buildScaleNotes(root: number, intervals: number[], startOctave = 3): number[] {
  // Build ascending scale from C3 region
  const rootMidi = root + (startOctave + 1) * 12;
  const notes: number[] = [];
  for (let oct = 0; oct <= 1; oct++) {
    for (const interval of intervals) {
      const midi = rootMidi + oct * 12 + interval;
      if (midi <= rootMidi + 12) notes.push(midi);
    }
  }
  // Add the octave root
  notes.push(rootMidi + 12);
  return [...new Set(notes)].sort((a, b) => a - b);
}

// Written note label from concert MIDI
function writtenNoteLabel(concertMidi: number): string {
  const writtenMidi = concertToWritten(concertMidi);
  const name = midiToNoteName(writtenMidi);
  const oct = midiToOctave(writtenMidi);
  return `${name}${oct}`;
}

// ── Sub-pages ─────────────────────────────────────────────────────────────────

type SubPage = "browser" | "play-along" | "long-tone";

// ── Scale Browser ─────────────────────────────────────────────────────────────

function ScaleBrowser() {
  const [root, setRoot] = useState<number | null>(0);
  const [scaleName, setScaleName] = useState<string | null>("Major");
  const [selectedNote, setSelectedNote] = useState<number | null>(null);

  const scaleDef = SCALES.find((s) => s.name === scaleName);
  const scaleHighlight = root !== null && scaleDef
    ? { root, intervals: scaleDef.intervals, degreeNames: scaleDef.degreeNames }
    : null;

  const scaleNotes = root !== null && scaleDef
    ? buildScaleNotes(root, scaleDef.intervals)
    : [];

  const displayNote = selectedNote ?? scaleNotes[0] ?? null;
  const writtenLabel = displayNote !== null ? writtenNoteLabel(displayNote) : null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: scale controls + piano */}
      <div className="flex flex-col flex-1 px-6 py-5 gap-5 overflow-auto">
        <ScaleSelector
          root={root}
          scaleName={scaleName}
          onRootChange={setRoot}
          onScaleChange={setScaleName}
        />

        {/* Scale note buttons */}
        {scaleNotes.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {scaleNotes.map((midi) => {
              const wLabel = writtenNoteLabel(midi);
              const isSelected = midi === displayNote;
              return (
                <button
                  key={midi}
                  onClick={() => setSelectedNote(midi)}
                  className={[
                    "px-2.5 py-1 rounded text-xs font-mono transition-colors",
                    isSelected
                      ? "bg-accent-blue text-white"
                      : "bg-bg-elevated text-text-secondary hover:text-text-primary",
                  ].join(" ")}
                  title={`Concert: ${noteLabel(midi)}`}
                >
                  {wLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* Piano */}
        <div>
          <Piano
            startMidi={48}
            endMidi={72}
            activeNotes={displayNote !== null ? new Set([displayNote]) : new Set()}
            scaleHighlight={scaleHighlight}
            showKeyboardLabels={false}
          />
        </div>

        {displayNote !== null && (
          <div className="text-xs text-text-muted">
            Concert: <span className="text-text-primary">{noteLabel(displayNote)}</span>
            &nbsp;·&nbsp;
            Written: <span className="text-accent-blue">{writtenLabel}</span>
          </div>
        )}
      </div>

      {/* Right: fingering chart */}
      <div className="w-52 border-l border-border flex flex-col items-center justify-center py-6 shrink-0">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-4">Fingering</p>
        <FingeringChart writtenNote={writtenLabel} size="sm" showAlternates />
      </div>
    </div>
  );
}

// ── Play-Along ────────────────────────────────────────────────────────────────

function PlayAlong() {
  const [root, setRoot] = useState<number | null>(0);
  const [scaleName, setScaleName] = useState<string | null>("Major");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const { pitchData, isListening, startListening, stopListening } = usePitchDetection();

  const scaleDef = SCALES.find((s) => s.name === scaleName);
  const scaleNotes = root !== null && scaleDef
    ? buildScaleNotes(root, scaleDef.intervals)
    : [];

  const targetMidi = scaleNotes[currentIndex] ?? null;
  const targetWritten = targetMidi !== null ? writtenNoteLabel(targetMidi) : null;

  // Detect correct note
  useEffect(() => {
    if (!isRunning || !pitchData || targetMidi === null) return;
    const writtenMidi = pitchData.writtenNote.midi;
    if (writtenMidi === targetMidi && Math.abs(pitchData.concertNote.cents) < 30) {
      // Advance
      if (currentIndex < scaleNotes.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        // Completed!
        setIsRunning(false);
        setCurrentIndex(0);
      }
    }
  }, [pitchData, targetMidi, isRunning, currentIndex, scaleNotes.length]);

  async function handleStart() {
    setCurrentIndex(0);
    setIsRunning(true);
    await startListening().catch(console.error);
  }

  function handleStop() {
    setIsRunning(false);
    stopListening();
    setCurrentIndex(0);
  }

  const progress = scaleNotes.length > 0 ? (currentIndex / scaleNotes.length) * 100 : 0;

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-col flex-1 px-6 py-5 gap-5 overflow-auto">
        <ScaleSelector
          root={root}
          scaleName={scaleName}
          onRootChange={setRoot}
          onScaleChange={setScaleName}
        />

        {/* Scale sequence */}
        {scaleNotes.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {scaleNotes.map((midi, i) => {
              const wLabel = writtenNoteLabel(midi);
              let cls = "px-2.5 py-1 rounded text-xs font-mono transition-colors ";
              if (i === currentIndex && isRunning) cls += "bg-accent-green text-white scale-110";
              else if (i < currentIndex) cls += "bg-bg-elevated text-accent-green/50";
              else cls += "bg-bg-elevated text-text-muted";
              return <div key={midi} className={cls}>{wLabel}</div>;
            })}
          </div>
        )}

        {/* Progress bar */}
        {isRunning && (
          <div className="w-full max-w-md">
            <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-green transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Target note */}
        {isRunning && targetMidi !== null && (
          <div className="text-center">
            <p className="text-text-muted text-sm mb-1">Play this note:</p>
            <p className="text-4xl font-bold text-accent-green">{targetWritten}</p>
            <p className="text-sm text-text-muted mt-1">
              {pitchData
                ? `Detected: ${pitchData.writtenNote.name}${pitchData.writtenNote.octave} (${pitchData.concertNote.cents > 0 ? "+" : ""}${pitchData.concertNote.cents}¢)`
                : "Play a note..."}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={scaleNotes.length === 0}
              className="px-8 py-3 rounded-lg bg-accent-blue text-white font-semibold text-sm hover:bg-blue-500 transition-colors disabled:opacity-40"
            >
              Start Play-Along
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-8 py-3 rounded-lg bg-accent-red text-white font-semibold text-sm hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          )}
        </div>

        {!isListening && isRunning && (
          <p className="text-xs text-text-muted">Waiting for mic...</p>
        )}
      </div>

      {/* Fingering chart */}
      <div className="w-52 border-l border-border flex flex-col items-center justify-center py-6 shrink-0">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-4">Target Fingering</p>
        <FingeringChart writtenNote={targetWritten} size="sm" showAlternates={false} />
      </div>
    </div>
  );
}

// ── Long Tone ─────────────────────────────────────────────────────────────────

interface StabilityPoint { cents: number; timestamp: number }

function LongTone() {
  const [targetNote, setTargetNote] = useState("G4");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stabilityPct, setStabilityPct] = useState<number | null>(null);
  const [readings, setReadings] = useState<StabilityPoint[]>([]);

  const { pitchData, isListening, startListening, stopListening } = usePitchDetection();
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readingsRef = useRef<StabilityPoint[]>([]);

  const WRITTEN_NOTES = [
    "Bb3","B3","C4","C#4","D4","Eb4","E4","F4","F#4","G4","G#4","A4",
    "Bb4","B4","C5","C#5","D5","Eb5","E5","F5","F#5","G5","G#5","A5","Bb5","B5","C6",
  ];

  useEffect(() => {
    if (!isRunning || !pitchData) return;
    const writtenLabel = `${pitchData.writtenNote.name}${pitchData.writtenNote.octave}`;
    if (writtenLabel !== targetNote) return;

    const point: StabilityPoint = {
      cents: pitchData.concertNote.cents,
      timestamp: Date.now(),
    };
    readingsRef.current = [...readingsRef.current, point];
    setReadings([...readingsRef.current]);

    // Stable = within ±15 cents
    const stable = readingsRef.current.filter((r) => Math.abs(r.cents) <= 15).length;
    setStabilityPct(Math.round((stable / readingsRef.current.length) * 100));
  }, [pitchData, isRunning, targetNote]);

  async function handleStart() {
    readingsRef.current = [];
    setReadings([]);
    setElapsed(0);
    setStabilityPct(null);
    startTimeRef.current = Date.now();
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 500);

    await startListening().catch(console.error);
  }

  function handleStop() {
    setIsRunning(false);
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const maxReading = 80; // show last 80 readings in chart
  const chartData = readings.slice(-maxReading);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-col flex-1 px-6 py-5 gap-5 overflow-auto">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted uppercase tracking-wider">Target Note (written)</label>
            <select
              value={targetNote}
              onChange={(e) => setTargetNote(e.target.value)}
              className="bg-bg-elevated text-text-primary border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent-blue"
              disabled={isRunning}
            >
              {WRITTEN_NOTES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-2.5 rounded-lg bg-accent-blue text-white font-semibold text-sm hover:bg-blue-500 transition-colors"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-8 py-2.5 rounded-lg bg-accent-red text-white font-semibold text-sm hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          )}
        </div>

        {/* Stats */}
        {(isRunning || readings.length > 0) && (
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary tabular-nums">{elapsed}s</div>
              <div className="text-xs text-text-muted mt-1">Time</div>
            </div>
            {stabilityPct !== null && (
              <div className="text-center">
                <div className={[
                  "text-3xl font-bold tabular-nums",
                  stabilityPct >= 80 ? "text-accent-green"
                    : stabilityPct >= 50 ? "text-accent-yellow"
                    : "text-accent-red"
                ].join(" ")}>
                  {stabilityPct}%
                </div>
                <div className="text-xs text-text-muted mt-1">Stable</div>
              </div>
            )}
            {pitchData && (
              <div className="text-center">
                <div className={[
                  "text-3xl font-bold tabular-nums",
                  Math.abs(pitchData.concertNote.cents) <= 10 ? "text-accent-green"
                    : Math.abs(pitchData.concertNote.cents) <= 25 ? "text-accent-yellow"
                    : "text-accent-red"
                ].join(" ")}>
                  {pitchData.concertNote.cents > 0 ? "+" : ""}{pitchData.concertNote.cents}¢
                </div>
                <div className="text-xs text-text-muted mt-1">Cents</div>
              </div>
            )}
          </div>
        )}

        {/* Stability chart */}
        {chartData.length > 1 && (
          <StabilityChart data={chartData} width={400} height={80} />
        )}

        {!isListening && isRunning && (
          <p className="text-xs text-text-muted">Waiting for mic...</p>
        )}
      </div>

      {/* Fingering */}
      <div className="w-52 border-l border-border flex flex-col items-center justify-center py-6 shrink-0">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-4">Fingering</p>
        <FingeringChart writtenNote={targetNote} size="sm" showAlternates />
      </div>
    </div>
  );
}

function StabilityChart({ data, width, height }: { data: StabilityPoint[]; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#2d2d4e";
    ctx.fillRect(0, 0, width, height);

    // Center line
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const step = width / (data.length - 1);
    for (let i = 1; i < data.length; i++) {
      const cents = data[i].cents;
      const abs = Math.abs(cents);
      ctx.strokeStyle = abs <= 10 ? "#2ecc71" : abs <= 25 ? "#f1c40f" : "#e74c3c";
      ctx.lineWidth = 1.5;
      const x0 = (i - 1) * step;
      const x1 = i * step;
      const clamp = (c: number) => Math.max(-50, Math.min(50, c));
      const y0 = height / 2 - (clamp(data[i - 1].cents) / 50) * (height / 2);
      const y1 = height / 2 - (clamp(cents) / 50) * (height / 2);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }, [data, width, height]);

  return (
    <canvas ref={canvasRef} className="rounded-lg" style={{ display: "block" }} />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ScalePracticePage() {
  const [subPage, setSubPage] = useState<SubPage>("browser");

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex border-b border-border shrink-0">
        {(["browser", "play-along", "long-tone"] as SubPage[]).map((sp) => (
          <button
            key={sp}
            onClick={() => setSubPage(sp)}
            className={[
              "px-5 py-3 text-sm transition-colors capitalize",
              subPage === sp
                ? "border-b-2 border-accent-blue text-text-primary"
                : "text-text-muted hover:text-text-primary",
            ].join(" ")}
          >
            {sp === "browser" ? "Scale Browser" : sp === "play-along" ? "Play-Along" : "Long Tones"}
          </button>
        ))}
      </div>

      {subPage === "browser" && <ScaleBrowser />}
      {subPage === "play-along" && <PlayAlong />}
      {subPage === "long-tone" && <LongTone />}
    </div>
  );
}
