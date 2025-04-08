'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TokenData {
  symbol: string;
  value: number;
  balance: number;
  marketData?: {
    price: number;
    percent_change_24h: number;
    market_cap: number;
    volume_24h: number;
  };
  percentage: number;
}

interface TokenDistributionChartProps {
  tokens: TokenData[];
}

export default function TokenDistributionChart({ tokens }: TokenDistributionChartProps) {
  // Filtrer les tokens qui ont un prix disponible et calculer leur valeur en USD
  const tokensWithValue = tokens
    .filter(token => token.marketData?.price)
    .map(token => ({
      symbol: token.symbol,
      value: token.value,
      balance: token.balance,
      marketData: token.marketData,
      percentage: 0 // Sera calculé après
    }))
    .sort((a, b) => b.value - a.value); // Trier par valeur décroissante

  // Calculer le total et les pourcentages
  const totalValue = tokensWithValue.reduce((sum, token) => sum + token.value, 0);
  tokensWithValue.forEach(token => {
    token.percentage = (token.value / totalValue) * 100;
  });

  // Préparer les données pour le graphique
  const data: ChartData<'pie'> = {
    labels: tokensWithValue.map(token => token.symbol),
    datasets: [
      {
        data: tokensWithValue.map(token => token.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgb(209, 213, 219)', // text-gray-300
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)', // bg-gray-900 avec opacity
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        padding: 16,
        callbacks: {
          label: (context) => {
            const token = tokensWithValue[context.dataIndex];
            return [
              `Valeur: $${token.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${token.percentage.toFixed(1)}%)`,
              `Balance: ${token.balance.toFixed(4)} ${token.symbol}`,
              `Prix: $${token.marketData?.price?.toFixed(6) || '0.00'}`,
              `24h: ${token.marketData?.percent_change_24h ? (token.marketData.percent_change_24h >= 0 ? '+' : '') + token.marketData.percent_change_24h.toFixed(2) : '0.00'}%`,
              `Volume: $${token.marketData?.volume_24h ? token.marketData.volume_24h.toLocaleString() : '0.00'}`
            ];
          },
        },
      },
    },
  };

  if (tokensWithValue.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-400">
        Aucun token avec des données de prix disponibles
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <Pie data={data} options={options} />
    </div>
  );
} 