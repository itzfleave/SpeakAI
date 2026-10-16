/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  height?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  height = 56,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 48;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const barWidth = (width / bars) * 0.65;
      const gap = (width / bars) * 0.35;

      for (let i = 0; i < bars; i++) {
        let barHeight = 4;
        if (isPlaying) {
          const freq1 = Math.sin((i / 6) + phase);
          const freq2 = Math.cos((i / 3) - phase * 1.4);
          const intensity = Math.abs(freq1 * 0.6 + freq2 * 0.4);
          barHeight = Math.max(4, intensity * (canvas.height - 8));
        } else {
          barHeight = 4 + Math.sin(i * 0.5) * 2;
        }

        const x = i * (barWidth + gap);
        const y = (canvas.height - barHeight) / 2;

        // Theme colors: Vibrant greenish green when playing, subtle zinc gray when idle
        ctx.fillStyle = isPlaying ? '#22c55e' : '#27272a';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.09;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="w-full flex items-center justify-center bg-black rounded-lg p-2.5 border border-zinc-800">
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full h-14 rounded block"
        aria-label="Audio waveform visualization"
      />
    </div>
  );
};
