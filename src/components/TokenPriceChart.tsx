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

    // Créer la nouvelle instance du graphique
    chartInstance.current = new Chart(ctx, {
      type: 'candlestick',
      data: {
        labels,
        datasets: [
          {
            label: 'OHLC',
            data: data.map(d => ({
              x: new Date(d.timestamp),
              o: d.open,
              h: d.high,
              l: d.low,
              c: d.close
            })),
            borderColor: '#3b82f6',
            color: {
              up: '#10b981',
              down: '#ef4444',
            },
          },
          {
            label: 'Volume',
            data: data.map(d => ({
              x: new Date(d.timestamp),
              y: d.volume
            })),
            type: 'bar',
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderWidth: 1,
            yAxisID: 'y1',
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#9ca3af',
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#9ca3af',
            bodyColor: '#fff',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const dataPoint = data[context.dataIndex];
                if (context.dataset.label === 'OHLC') {
                  return [
                    `Open: $${dataPoint.open.toFixed(2)}`,
                    `High: $${dataPoint.high.toFixed(2)}`,
                    `Low: $${dataPoint.low.toFixed(2)}`,
                    `Close: $${dataPoint.close.toFixed(2)}`
                  ];
                } else {
                  return `Volume: $${dataPoint.volume.toLocaleString()}`;
                }
              },
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
            display: true,
            grid: {
              color: '#374151',
            },
            ticks: {
              color: '#9ca3af',
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
              color: '#374151',
            },
            ticks: {
              color: '#9ca3af',
              callback: (value) => `$${value.toFixed(2)}`,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: '#9ca3af',
              callback: (value) => `$${value.toLocaleString()}`,
            },
          },
        },
      },
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