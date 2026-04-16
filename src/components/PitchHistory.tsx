import { useRef, useEffect } from "react";
import type { PitchData } from "../hooks/usePitchDetection";

interface PitchHistoryProps {
  history: PitchData[];
  width?: number;
  height?: number;
}

export function PitchHistory({ history, width = 320, height = 80 }: PitchHistoryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#2d2d4e";
    ctx.fillRect(0, 0, width, height);

    // Center line (0 cents)
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // ±10 cent lines
    const tenCentY = (10 / 50) * (height / 2);
    ctx.strokeStyle = "rgba(46,204,113,0.2)";
    [height / 2 - tenCentY, height / 2 + tenCentY].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    if (history.length < 2) return;

    // Draw cents history
    const step = width / (history.length - 1);

    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";

    // Colour each segment by how in-tune it is
    for (let i = 1; i < history.length; i++) {
      const cents = history[i].concertNote.cents;
      const abs = Math.abs(cents);
      if (abs <= 10) ctx.strokeStyle = "#2ecc71";
      else if (abs <= 25) ctx.strokeStyle = "#f1c40f";
      else ctx.strokeStyle = "#e74c3c";

      const x0 = (i - 1) * step;
      const x1 = i * step;
      const clamp = (c: number) => Math.max(-50, Math.min(50, c));
      const y0 = height / 2 - (clamp(history[i - 1].concertNote.cents) / 50) * (height / 2);
      const y1 = height / 2 - (clamp(cents) / 50) * (height / 2);

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }, [history, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg"
      style={{ display: "block" }}
    />
  );
}
