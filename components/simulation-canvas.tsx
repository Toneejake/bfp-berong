"use client";
import { useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";

// Simple color mapping
const STATUS_COLORS = {
  evacuating: 'blue',
  escaped: 'lime',
  burned: 'black',
};

interface AnimationData {
  history: {
    fire_map: [number, number][];
    agents: [[number, number], string][];
  }[];
  exits: [number, number][];
  grid_shape: [number, number];
}

export default function SimulationCanvas({ animationData }: { animationData: AnimationData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !animationData) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { history, exits, grid_shape } = animationData;
    const [rows, cols] = grid_shape;
    let frame = 0;

    const draw = () => {
      if (frame >= history.length) return;

      // Clear canvas
      ctx.clearRect(0, 0, cols, rows);

      // Draw fire (simple rectangles for performance)
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      const fireCells = history[frame].fire_map;
      for (const [y, x] of fireCells) {
        ctx.fillRect(x, y, 1, 1);
      }

      // Draw agents - ensure coordinates are in (x,y) format where x is horizontal, y is vertical
      const agents = history[frame].agents;
      for (const [pos, status] of agents) {
        ctx.fillStyle = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
        ctx.beginPath();
        // Ensure pos is treated as [x, y] for canvas coordinates
        ctx.arc(pos[0], pos[1], 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw exits - ensure coordinates are in (x,y) format
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      for (const [x, y] of exits) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.stroke();
      }

      frame++;
      requestAnimationFrame(draw);
    };

    draw();

  }, [animationData]);
  
  return (
    <Card>
      <CardContent className="p-2">
        <canvas ref={canvasRef} width={256} height={256} className="w-full h-auto" />
      </CardContent>
    </Card>
  );
}
