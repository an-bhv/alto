import { usePitchDetection } from "../hooks/usePitchDetection";
import { NoteDisplay } from "../components/NoteDisplay";
import { CentsMeter } from "../components/CentsMeter";
import { PitchHistory } from "../components/PitchHistory";

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

  async function handleToggle() {
    if (isListening) stopListening();
    else await startListening().catch((err: unknown) => {
      console.error("Microphone access denied:", err);
    });
  }

  const cents = pitchData?.concertNote.cents ?? null;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8">
      <h1 className="text-xs tracking-widest text-text-muted uppercase">Alto Sax Tuner</h1>

      {/* Note display */}
      <NoteDisplay
        writtenNote={pitchData?.writtenNote ?? null}
        concertNote={pitchData?.concertNote ?? null}
        frequency={pitchData?.frequency ?? null}
        cents={cents}
      />

      {/* In-tune label */}
      <div className="h-5">
        <InTuneLabel cents={cents} />
      </div>

      {/* Cents meter */}
      <CentsMeter cents={cents} />

      {/* Pitch history */}
      <PitchHistory history={history} width={320} height={72} />

      {/* Start / Stop */}
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

      <p className="text-xs text-text-muted">Reference: A4 = 440 Hz</p>
    </div>
  );
}
