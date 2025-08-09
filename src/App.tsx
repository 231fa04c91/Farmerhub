import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import WeatherSection from './components/weather/WeatherSection';
import MarketSection from './components/market/MarketSection';
import ShopSection from './components/shop/ShopSection';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <Navigation />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<WeatherSection />} />
            <Route path="/weather" element={<WeatherSection />} />
            <Route path="/market" element={<MarketSection />} />
            <Route path="/shop" element={<ShopSection />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;