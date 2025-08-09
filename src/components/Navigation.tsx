import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cloud, TrendingUp, Store, Leaf } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/weather', label: 'Weather', icon: Cloud },
    { path: '/market', label: 'Market', icon: TrendingUp },
    { path: '/shop', label: 'Shop', icon: Store },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-green-700 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl">
            <Leaf className="w-8 h-8 text-yellow-400" />
            <span>Farmer's Hub</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-green-800 text-yellow-400'
                    : 'text-green-100 hover:bg-green-600 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="md:hidden">
            <div className="flex space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`p-2 rounded-md transition-colors ${
                    location.pathname === path
                      ? 'bg-green-800 text-yellow-400'
                      : 'text-green-100 hover:bg-green-600'
                  }`}
                  title={label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;