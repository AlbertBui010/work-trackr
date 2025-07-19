import React, { useEffect, useRef } from 'react';
import { useWorkLogs } from '../contexts/WorkLogContext';

const WeeklyChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { workLogs } = useWorkLogs();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get last 7 days data
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return date;
    });

    const dailyHours = last7Days.map(date => {
      const dayLogs = workLogs.filter(log => {
        const logDate = new Date(log.startTime);
        return logDate.toDateString() === date.toDateString();
      });
      return dayLogs.reduce((sum, log) => sum + log.duration, 0) / 60; // Convert to hours
    });

    const maxHours = Math.max(...dailyHours, 8); // Minimum scale of 8 hours
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set styles
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.font = '12px Inter, sans-serif';

    // Draw bars
    const barWidth = chartWidth / 7;
    dailyHours.forEach((hours, index) => {
      const barHeight = (hours / maxHours) * chartHeight;
      const x = padding + index * barWidth + barWidth * 0.2;
      const y = canvas.height - padding - barHeight;
      const width = barWidth * 0.6;

      // Draw bar
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, y, width, barHeight);

      // Draw day label
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      const dayLabel = last7Days[index].toLocaleDateString([], { weekday: 'short' });
      ctx.fillText(dayLabel, x + width / 2, canvas.height - padding + 20);

      // Draw hours label
      if (hours > 0) {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(hours.toFixed(1) + 'h', x + width / 2, y - 5);
      }
    });

    // Draw y-axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const hours = (maxHours / 4) * i;
      const y = canvas.height - padding - (chartHeight / 4) * i;
      ctx.fillText(hours.toFixed(0) + 'h', padding - 10, y + 4);
    }

  }, [workLogs]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="w-full h-auto max-w-full"
        style={{ maxHeight: '300px' }}
      />
    </div>
  );
};

export default WeeklyChart;