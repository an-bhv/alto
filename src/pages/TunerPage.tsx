import { useState } from "react";
import { usePitchDetection } from "../hooks/usePitchDetection";
import { NoteDisplay } from "../components/NoteDisplay";
import { CentsMeter } from "../components/CentsMeter";
import { PitchHistory } from "../components/PitchHistory";
import { FingeringChart } from "../components/FingeringChart";
import { noteLabel } from "../data/notes";

function InTuneLabel({ cents }: { cents: number | null }) {
  if (cents === null) return null;
  const abs = Math.abs(cents);
  if (abs <= 10) return <span className="text-accent-green font-semibold tracking-widest text-sm">IN TUNE</span>;
  if (abs <= 25) return <span className="text-accent-yellow font-semibold tracking-widest text-sm">{cents < 0 ? "FLAT" : "SHARP"}</span>;
  return <span className="text-accent-red font-semibold tracking-widest text-sm">{cents < 0 ? "TOO FLAT" : "TOO SHARP"}</span>;
}

export function TunerPage() {
  const { pitchData, isListening, startListening, stopListening, history } =
    usePitchDetection();
  const [micError, setMicError] = useState<string | null>(null);

  async function handleToggle() {
    if (isListening) {
      stopListening();
      return;
    }
    setMicError(null);
    try {
      await startListening();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Microphone access failed:", err);
      setMicError(msg);
    }
  }

  const cents = pitchData?.concertNote.cents ?? null;
  const writtenNoteLabel = pitchData?.writtenNote
    ? noteLabel(pitchData.writtenNote.midi)
    : null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: tuner */}
      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-8">
        <h1 className="text-xs tracking-widest text-text-muted uppercase">Alto Sax Tuner</h1>

        <NoteDisplay
          writtenNote={pitchData?.writtenNote ?? null}
          concertNote={pitchData?.concertNote ?? null}
          frequency={pitchData?.frequency ?? null}
          cents={cents}
        />

        <div className="h-5">
          <InTuneLabel cents={cents} />
        </div>

        <CentsMeter cents={cents} />

        <PitchHistory history={history} width={300} height={68} />

        <button
          onClick={handleToggle}
          className={[
            "px-10 py-3 rounded-lg font-semibold text-sm tracking-wide transition-colors",
            isListening
              ? "bg-accent-red hover:bg-red-600 text-white"
              : "bg-accent-blue hover:bg-blue-500 text-white",
          ].join(" ")}
        >
          {isListening ? "Stop" : "Start Listening"}
        </button>

        <p className="text-xs text-text-muted">
          {isListening ? "Listening — play a note!" : "Press the button and allow microphone access"}
        </p>

        {micError && (
          <p className="text-xs text-accent-red max-w-sm text-center">
            Mic error: {micError}
          </p>
        )}

        <p className="text-xs text-text-muted">Reference: A4 = 440 Hz</p>
      </div>

      {/* Right: fingering chart for detected note */}
      <div className="w-56 border-l border-border flex flex-col items-center justify-center py-6 shrink-0">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-4">Fingering</p>
        <FingeringChart
          writtenNote={writtenNoteLabel}
          size="sm"
          showAlternates={false}
        />
      </div>
    </div>
  );
}
