import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';

interface MarketChartProps {
  selectedCrop: string;
}

const MarketChart: React.FC<MarketChartProps> = ({ selectedCrop }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !selectedCrop) return;

    // Generate dummy price trend data for the selected crop
    const generatePriceData = (cropName: string) => {
      const dates = [];
      const prices = [];
      const basePrice = Math.floor(Math.random() * 5000) + 2000;
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
        
        // Generate realistic price fluctuations
        const variation = (Math.random() - 0.5) * 200;
        const price = Math.max(basePrice + variation + (Math.sin(i / 5) * 100), 500);
        prices.push(Math.round(price));
      }
      
      return { dates, prices };
    };

    const { dates, prices } = generatePriceData(selectedCrop);

    const trace = {
      x: dates,
      y: prices,
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        color: '#16a34a',
        width: 3,
      },
      marker: {
        color: '#16a34a',
        size: 6,
      },
      name: selectedCrop,
    };

    const layout = {
      title: {
        text: `${selectedCrop} Price Trend (30 Days)`,
        font: {
          size: 16,
          color: '#374151',
        },
      },
      xaxis: {
        title: 'Date',
        titlefont: {
          size: 12,
          color: '#6b7280',
        },
        tickfont: {
          size: 10,
          color: '#6b7280',
        },
      },
      yaxis: {
        title: 'Price (₹/quintal)',
        titlefont: {
          size: 12,
          color: '#6b7280',
        },
        tickfont: {
          size: 10,
          color: '#6b7280',
        },
      },
      margin: {
        l: 60,
        r: 20,
        t: 50,
        b: 40,
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: false,
    };

    const config = {
      displayModeBar: false,
      responsive: true,
    };

    Plotly.newPlot(chartRef.current, [trace], layout, config);

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [selectedCrop]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Trends</h3>
      
      {selectedCrop ? (
        <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p>Click on a crop in the table to view its price trend</p>
        </div>
      )}
    </div>
  );
};

export default MarketChart;