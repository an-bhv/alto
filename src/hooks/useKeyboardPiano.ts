import { useEffect, useRef } from "react";
import { KEYBOARD_TO_MIDI } from "../data/keyboardMapping";

/**
 * Binds computer keyboard to piano noteOn/noteOff callbacks.
 * Handles key repeat prevention and modifier key filtering.
 */
export function useKeyboardPiano(
  onNoteOn: (midi: number) => void,
  onNoteOff: (midi: number) => void,
): void {
  const held = useRef(new Set<string>());
  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);
  onNoteOnRef.current = onNoteOn;
  onNoteOffRef.current = onNoteOff;

  useEffect(() => {
    function handleDown(e: KeyboardEvent) {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (held.current.has(k)) return;
      const midi = KEYBOARD_TO_MIDI[k];
      if (midi !== undefined) {
        held.current.add(k);
        onNoteOnRef.current(midi);
      }
    }

    function handleUp(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      held.current.delete(k);
      const midi = KEYBOARD_TO_MIDI[k];
      if (midi !== undefined) {
        onNoteOffRef.current(midi);
      }
    }

    document.addEventListener("keydown", handleDown);
    document.addEventListener("keyup", handleUp);
    return () => {
      document.removeEventListener("keydown", handleDown);
      document.removeEventListener("keyup", handleUp);
    };
  }, []);
}
