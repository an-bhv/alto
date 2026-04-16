import { useState } from "react";
import { FingeringChart } from "../components/FingeringChart";
import { WRITTEN_NOTES_ORDERED } from "../data/fingerings";

export function FingeringPage() {
  const [selectedNote, setSelectedNote] = useState<string>("G4");

  const currentIndex = WRITTEN_NOTES_ORDERED.indexOf(selectedNote);

  function prev() {
    if (currentIndex > 0) setSelectedNote(WRITTEN_NOTES_ORDERED[currentIndex - 1]);
  }

  function next() {
    if (currentIndex < WRITTEN_NOTES_ORDERED.length - 1)
      setSelectedNote(WRITTEN_NOTES_ORDERED[currentIndex + 1]);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Note grid */}
      <div className="px-6 pt-5 pb-3 border-b border-border">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Select note (written pitch)</p>
        <div className="flex flex-wrap gap-1.5">
          {WRITTEN_NOTES_ORDERED.map((note) => (
            <button
              key={note}
              onClick={() => setSelectedNote(note)}
              className={[
                "px-2.5 py-1 rounded text-xs font-mono transition-colors",
                note === selectedNote
                  ? "bg-accent-blue text-white"
                  : "bg-bg-elevated text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              ].join(" ")}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 items-center justify-center gap-16 p-6 overflow-auto">
        {/* Prev/Next navigation */}
        <button
          onClick={prev}
          disabled={currentIndex <= 0}
          className="text-text-muted hover:text-text-primary disabled:opacity-20 transition-colors text-2xl w-10 h-10 flex items-center justify-center"
        >
          ‹
        </button>

        {/* Fingering diagram */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-3xl font-bold text-text-primary">{selectedNote}</h2>
          <FingeringChart writtenNote={selectedNote} size="lg" showAlternates />
        </div>

        <button
          onClick={next}
          disabled={currentIndex >= WRITTEN_NOTES_ORDERED.length - 1}
          className="text-text-muted hover:text-text-primary disabled:opacity-20 transition-colors text-2xl w-10 h-10 flex items-center justify-center"
        >
          ›
        </button>
      </div>
    </div>
  );
}
