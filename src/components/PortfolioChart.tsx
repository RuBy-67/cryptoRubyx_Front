import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface PortfolioChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export default function PortfolioChart({ data }: PortfolioChartProps) {
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

    // Créer le gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    // Calculer les variations en pourcentage
    const calculatePercentageChange = (currentValue: number, previousValue: number | null) => {
      if (previousValue === null || previousValue === 0) return 0;
      return ((currentValue - previousValue) / previousValue) * 100;
    };

    // Vérifier si les données sont valides
    const validData = {
      labels: data.labels.filter((_, i) => data.values[i] !== null),
      values: data.values.filter(value => value !== null)
    };

    // Créer la nouvelle instance du graphique
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: validData.labels,
        datasets: [
          {
            label: 'Valeur du Portfolio',
            data: validData.values,
            borderColor: '#3b82f6',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#3b82f6',
            pointHoverBorderColor: '#fff',
          },
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
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#1f2937',
            titleColor: '#9ca3af',
            bodyColor: '#fff',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              title: (context) => {
                if (!context || !context[0] || context[0].dataIndex === undefined) return '';
                const date = new Date(validData.labels[context[0].dataIndex]);
                return date.toLocaleDateString('fr-FR', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              },
              label: (context) => {
                if (!context || context.parsed === undefined || context.parsed.y === undefined) return '';
                const currentValue = context.parsed.y;
                const previousValue = context.dataIndex > 0 ? validData.values[context.dataIndex - 1] : null;
                const percentageChange = calculatePercentageChange(currentValue, previousValue);
                
                return [
                  `Valeur: $${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  `Variation: ${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(2)}%`
                ];
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(75, 85, 99, 0.2)',
            },
            ticks: {
              color: '#9ca3af',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(75, 85, 99, 0.2)',
            },
            ticks: {
              color: '#9ca3af',
              callback: (value) => `$${value.toLocaleString()}`
            }
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