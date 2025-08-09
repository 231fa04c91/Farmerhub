import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Download } from 'lucide-react';
import MarketChart from './MarketChart';

interface CropPrice {
  id: number;
  name: string;
  price: number;
  change: number;
  market: string;
  unit: string;
}

const MarketSection = () => {
  const [crops, setCrops] = useState<CropPrice[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<CropPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('name');
  const [selectedCrop, setSelectedCrop] = useState<string>('');

  // Dummy crop data
  useEffect(() => {
    const dummyData: CropPrice[] = [
      { id: 1, name: 'Rice', price: 2800, change: 150, market: 'Guntur', unit: 'quintal' },
      { id: 2, name: 'Wheat', price: 2200, change: -80, market: 'Hyderabad', unit: 'quintal' },
      { id: 3, name: 'Cotton', price: 6500, change: 300, market: 'Warangal', unit: 'quintal' },
      { id: 4, name: 'Sugarcane', price: 350, change: 25, market: 'Krishna', unit: 'quintal' },
      { id: 5, name: 'Turmeric', price: 8900, change: -200, market: 'Nizamabad', unit: 'quintal' },
      { id: 6, name: 'Chili', price: 12000, change: 500, market: 'Guntur', unit: 'quintal' },
      { id: 7, name: 'Groundnut', price: 5800, change: 180, market: 'Anantapur', unit: 'quintal' },
      { id: 8, name: 'Maize', price: 2000, change: -50, market: 'Karimnagar', unit: 'quintal' },
      { id: 9, name: 'Tomato', price: 2500, change: 200, market: 'Rangareddy', unit: 'quintal' },
      { id: 10, name: 'Onion', price: 1800, change: -120, market: 'Kurnool', unit: 'quintal' },
    ];
    setCrops(dummyData);
    setFilteredCrops(dummyData);
  }, []);

  // Filter crops based on search term
  useEffect(() => {
    const filtered = crops.filter(crop =>
      crop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCrops(filtered);
  }, [crops, searchTerm]);

  // Sort crops
  const sortedCrops = [...filteredCrops].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return b.price - a.price;
      case 'change':
        return b.change - a.change;
      default:
        return 0;
    }
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Crop Name', 'Price (₹/quintal)', 'Change (₹)', 'Market'];
    const csvContent = [
      headers.join(','),
      ...filteredCrops.map(crop => 
        [crop.name, crop.price, crop.change, crop.market].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'market_prices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Market Prices</h1>
        <p className="text-green-600">Real-time crop prices and market trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search crops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'change')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="change">Sort by Change</option>
                </select>
              </div>
              
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Crop</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Price (₹/quintal)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Change</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Market</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCrops.map((crop) => (
                    <tr 
                      key={crop.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedCrop(crop.name)}
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{crop.name}</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-semibold text-gray-900">₹{crop.price.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className={`flex items-center justify-end space-x-1 ${
                          crop.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {crop.change > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-medium">
                            {crop.change > 0 ? '+' : ''}₹{crop.change}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600">{crop.market}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedCrops.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No crops found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <MarketChart selectedCrop={selectedCrop} />
        </div>
      </div>
    </div>
  );
};

export default MarketSection;