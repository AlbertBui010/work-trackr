import React, { useEffect, useRef } from 'react';
import { WorkLog } from '../contexts/WorkLogContext';

interface AnalyticsChartProps {
  data: WorkLog[];
  type: 'time' | 'workType';
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) {
      // Draw "No data" message
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
      return;
    }

    if (type === 'time') {
      drawTimeChart(ctx, canvas, data);
    } else {
      drawWorkTypeChart(ctx, canvas, data);
    }
  }, [data, type]);

  const drawTimeChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, logs: WorkLog[]) => {
    // Group by hour of day
    const hourlyData = Array.from({ length: 24 }, () => 0);
    
    logs.forEach(log => {
      const hour = new Date(log.startTime).getHours();
      hourlyData[hour] += log.duration / 60; // Convert to hours
    });

    const maxHours = Math.max(...hourlyData, 1);
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / 24;

    // Draw bars
    hourlyData.forEach((hours, index) => {
      const barHeight = (hours / maxHours) * chartHeight;
      const x = padding + index * barWidth + barWidth * 0.1;
      const y = canvas.height - padding - barHeight;
      const width = barWidth * 0.8;

      // Draw bar
      ctx.fillStyle = hours > 0 ? '#3b82f6' : '#475569';
      ctx.fillRect(x, y, width, barHeight);

      // Draw hour labels (every 4 hours)
      if (index % 4 === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const hour = index === 0 ? '12am' : index === 12 ? '12pm' : index > 12 ? `${index - 12}pm` : `${index}am`;
        ctx.fillText(hour, x + width / 2, canvas.height - padding + 15);
      }
    });

    // Draw y-axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const hours = (maxHours / 4) * i;
      const y = canvas.height - padding - (chartHeight / 4) * i;
      ctx.fillText(hours.toFixed(1) + 'h', padding - 5, y + 3);
    }
  };

  const drawWorkTypeChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, logs: WorkLog[]) => {
    // Group by work type
    const typeData = logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + log.duration / 60;
      return acc;
    }, {} as Record<string, number>);

    const types = Object.keys(typeData);
    const values = Object.values(typeData);
    const total = values.reduce((sum, val) => sum + val, 0);

    if (total === 0) return;

    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    let currentAngle = -Math.PI / 2; // Start at top

    // Draw pie slices
    types.forEach((type, index) => {
      const sliceAngle = (values[index] / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      // Draw labels
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(type, labelX, labelY);
      
      // Draw percentage
      const percentage = ((values[index] / total) * 100).toFixed(1);
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${percentage}%`, labelX, labelY + 15);

      currentAngle += sliceAngle;
    });

    // Draw legend
    types.forEach((type, index) => {
      const legendY = 20 + index * 20;
      
      // Color box
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(10, legendY - 8, 12, 12);
      
      // Text
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${type}: ${values[index].toFixed(1)}h`, 30, legendY + 2);
    });
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="w-full h-auto max-w-full"
        style={{ maxHeight: '300px' }}
      />
    </div>
  );
};

export default AnalyticsChart;