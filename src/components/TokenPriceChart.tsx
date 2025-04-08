import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface TokenPriceChartProps {
  data: {
    timestamp: string;
    price: number;
    volume: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
}

export default function TokenPriceChart({ data }: TokenPriceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Détruire l'instance précédente si elle existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Créer le gradient pour le prix
    const priceGradient = ctx.createLinearGradient(0, 0, 0, 400);
    priceGradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    priceGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    // Formater les données
    const labels = data.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    });


    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="chart-container h-64">
      <canvas ref={chartRef} />
    </div>
  );
} 