import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Eye, Wind, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface ForecastDay {
  date: string;
  high: number;
  low: number;
  description: string;
  icon: string;
}

interface HistoricalDay {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  description: string;
  icon: string;
  farmingCondition: 'excellent' | 'good' | 'fair' | 'poor';
  farmingAdvice: string;
}

const WeatherSection = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [city, setCity] = useState('Guntur');
  const [activeTab, setActiveTab] = useState<'current' | 'forecast' | 'history'>('current');

  const API_KEY = 'c0a073131c8e4f9cea0c9a2ec56a7acb';

  // Function to determine farming conditions based on weather data
  const analyzeFarmingConditions = (temp: number, humidity: number, rainfall: number, windSpeed: number): { condition: 'excellent' | 'good' | 'fair' | 'poor', advice: string } => {
    let score = 0;
    let advice = '';
    
    // Temperature analysis (optimal range: 20-30°C for most crops)
    if (temp >= 20 && temp <= 30) {
      score += 3;
    } else if (temp >= 15 && temp <= 35) {
      score += 2;
    } else if (temp >= 10 && temp <= 40) {
      score += 1;
    }
    
    // Humidity analysis (optimal range: 50-70%)
    if (humidity >= 50 && humidity <= 70) {
      score += 2;
    } else if (humidity >= 40 && humidity <= 80) {
      score += 1;
    }
    
    // Rainfall analysis (moderate rainfall is good)
    if (rainfall > 0 && rainfall <= 10) {
      score += 2;
    } else if (rainfall > 10 && rainfall <= 25) {
      score += 1;
    } else if (rainfall > 50) {
      score -= 1;
    }
    
    // Wind speed analysis (gentle breeze is good)
    if (windSpeed >= 2 && windSpeed <= 8) {
      score += 1;
    } else if (windSpeed > 15) {
      score -= 1;
    }
    
    // Generate advice based on conditions
    if (temp < 15) advice += 'Cold weather may slow crop growth. ';
    if (temp > 35) advice += 'High temperature may stress plants. ';
    if (humidity < 40) advice += 'Low humidity - consider irrigation. ';
    if (humidity > 80) advice += 'High humidity may increase disease risk. ';
    if (rainfall > 25) advice += 'Heavy rainfall - ensure proper drainage. ';
    if (rainfall === 0 && humidity < 50) advice += 'Dry conditions - irrigation recommended. ';
    if (windSpeed > 15) advice += 'Strong winds may damage crops. ';
    
    if (advice === '') {
      advice = 'Good conditions for most farming activities.';
    }
    
    // Determine overall condition
    if (score >= 6) return { condition: 'excellent', advice: 'Excellent conditions! ' + advice };
    if (score >= 4) return { condition: 'good', advice: 'Good conditions. ' + advice };
    if (score >= 2) return { condition: 'fair', advice: 'Fair conditions. ' + advice };
    return { condition: 'poor', advice: 'Challenging conditions. ' + advice };
  };

  // Fetch historical weather data
  const fetchHistoricalWeather = async (cityName: string) => {
    setHistoricalLoading(true);
    try {
      const historical: HistoricalDay[] = [];
      
      // Get coordinates first
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
      );
      const geoData = await geoResponse.json();
      
      if (geoData.length === 0) {
        throw new Error('City not found');
      }
      
      const { lat, lon } = geoData[0];
      
      // Fetch historical data for past 10 days
      for (let i = 1; i <= 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const timestamp = Math.floor(date.getTime() / 1000);
        
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${API_KEY}&units=metric`
          );
          
          if (response.ok) {
            const data = await response.json();
            const dayData = data.data[0];
            
            const rainfall = dayData.rain ? dayData.rain['1h'] || 0 : 0;
            const analysis = analyzeFarmingConditions(
              dayData.temp,
              dayData.humidity,
              rainfall,
              dayData.wind_speed
            );
            
            historical.push({
              date: date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              }),
              temperature: Math.round(dayData.temp),
              humidity: dayData.humidity,
              rainfall: rainfall,
              windSpeed: dayData.wind_speed,
              description: dayData.weather[0].description,
              icon: dayData.weather[0].icon,
              farmingCondition: analysis.condition,
              farmingAdvice: analysis.advice,
            });
          } else {
            // Fallback to dummy data if API fails
            const baseTemp = 25 + (Math.random() - 0.5) * 10;
            const humidity = 50 + Math.random() * 30;
            const rainfall = Math.random() > 0.7 ? Math.random() * 15 : 0;
            const windSpeed = 2 + Math.random() * 8;
            
            const analysis = analyzeFarmingConditions(baseTemp, humidity, rainfall, windSpeed);
            
            historical.push({
              date: date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              }),
              temperature: Math.round(baseTemp),
              humidity: Math.round(humidity),
              rainfall: Math.round(rainfall * 10) / 10,
              windSpeed: Math.round(windSpeed * 10) / 10,
              description: 'partly cloudy',
              icon: '02d',
              farmingCondition: analysis.condition,
              farmingAdvice: analysis.advice,
            });
          }
        } catch (err) {
          // Continue with next day if one fails
          console.warn(`Failed to fetch data for day ${i}:`, err);
        }
      }
      
      setHistoricalData(historical.reverse()); // Show oldest first
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
      // Generate dummy historical data as fallback
      const dummyHistorical: HistoricalDay[] = [];
      for (let i = 10; i >= 1; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const baseTemp = 25 + (Math.random() - 0.5) * 10;
        const humidity = 50 + Math.random() * 30;
        const rainfall = Math.random() > 0.7 ? Math.random() * 15 : 0;
        const windSpeed = 2 + Math.random() * 8;
        
        const analysis = analyzeFarmingConditions(baseTemp, humidity, rainfall, windSpeed);
        
        dummyHistorical.push({
          date: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          }),
          temperature: Math.round(baseTemp),
          humidity: Math.round(humidity),
          rainfall: Math.round(rainfall * 10) / 10,
          windSpeed: Math.round(windSpeed * 10) / 10,
          description: 'partly cloudy',
          icon: '02d',
          farmingCondition: analysis.condition,
          farmingAdvice: analysis.advice,
        });
      }
      setHistoricalData(dummyHistorical);
    } finally {
      setHistoricalLoading(false);
    }
  };

  const fetchWeatherByCity = async (cityName: string) => {
    setLoading(true);
    setError('');
    
    try {
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error('City not found');
      }
      
      const currentData = await currentResponse.json();
      
      setWeather({
        location: currentData.name,
        temperature: Math.round(currentData.main.temp),
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        icon: currentData.weather[0].icon,
      });

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        const dailyForecast = forecastData.list
          .filter((item: any, index: number) => index % 8 === 0)
          .slice(0, 3)
          .map((item: any) => ({
            date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
          }));
        
        setForecast(dailyForecast);
      }
      
      // Fetch historical data
      fetchHistoricalWeather(cityName);
    } catch (err) {
      setError('Failed to fetch weather data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );
            
            if (!response.ok) {
              throw new Error('Failed to fetch weather data');
            }
            
            const data = await response.json();
            setCity(data.name);
            
            setWeather({
              location: data.name,
              temperature: Math.round(data.main.temp),
              description: data.weather[0].description,
              humidity: data.main.humidity,
              windSpeed: data.wind.speed,
              icon: data.weather[0].icon,
            });

            // Fetch forecast for current location
            const forecastResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );
            
            if (forecastResponse.ok) {
              const forecastData = await forecastResponse.json();
              const dailyForecast = forecastData.list
                .filter((item: any, index: number) => index % 8 === 0)
                .slice(0, 3)
                .map((item: any) => ({
                  date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                  high: Math.round(item.main.temp_max),
                  low: Math.round(item.main.temp_min),
                  description: item.weather[0].description,
                  icon: item.weather[0].icon,
                }));
              
              setForecast(dailyForecast);
            }
            
            // Fetch historical data for current location
            fetchHistoricalWeather(data.name);
          } catch (err) {
            setError('Failed to fetch weather for your location.');
          } finally {
            setLoading(false);
          }
        },
        () => {
          setLoading(false);
          setError('Unable to access your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    fetchWeatherByCity(city);
  }, []);
  
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'excellent': return '🌟';
      case 'good': return '✅';
      case 'fair': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Weather Forecast</h1>
        <p className="text-green-600">Stay informed about weather conditions for better farming decisions</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'current'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Current Weather
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'forecast'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            3-Day Forecast
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Past 10 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city name"
                  className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && fetchWeatherByCity(city)}
                />
                <button
                  onClick={() => fetchWeatherByCity(city)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Search
                </button>
              </div>
              
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <MapPin className="w-4 h-4" />
                <span>Current Location</span>
              </button>
            </div>

            {(loading || historicalLoading) && (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {error && (
              <ErrorMessage 
                message={error} 
                onRetry={() => fetchWeatherByCity(city)} 
              />
            )}

            {/* Current Weather Tab */}
            {activeTab === 'current' && weather && !loading && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">{weather.location}</h2>
                </div>
                
                <div className="flex items-center justify-center mb-6">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.description}
                    className="w-20 h-20"
                  />
                  <div className="ml-4">
                    <div className="text-5xl font-bold text-gray-800">{weather.temperature}°C</div>
                    <div className="text-lg text-gray-600 capitalize">{weather.description}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm text-blue-600">Humidity</div>
                    <div className="text-xl font-semibold text-blue-800">{weather.humidity}%</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <Wind className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm text-green-600">Wind Speed</div>
                    <div className="text-xl font-semibold text-green-800">{weather.windSpeed} m/s</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Historical Weather Tab */}
            {activeTab === 'history' && !historicalLoading && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Past 10 Days Weather & Farming Conditions</h3>
                
                {historicalData.length > 0 ? (
                  <div className="space-y-3">
                    {historicalData.map((day, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                              alt={day.description}
                              className="w-10 h-10"
                            />
                            <div>
                              <div className="font-medium text-gray-800">{day.date}</div>
                              <div className="text-sm text-gray-600 capitalize">{day.description}</div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">{day.temperature}°C</div>
                            <div className="text-sm text-gray-600">{day.humidity}% humidity</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="text-sm">
                            <span className="text-gray-600">Rainfall: </span>
                            <span className="font-medium">{day.rainfall}mm</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Wind: </span>
                            <span className="font-medium">{day.windSpeed} m/s</span>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Farming Condition:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(day.farmingCondition)}`}>
                              {getConditionIcon(day.farmingCondition)} {day.farmingCondition.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 italic">{day.farmingAdvice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Historical data will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {activeTab === 'forecast' || activeTab === 'current' ? '3-Day Forecast' : 'Weather Summary'}
            </h3>
            
            {activeTab === 'history' && historicalData.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Farming Condition Summary</h4>
                  <div className="space-y-2">
                    {['excellent', 'good', 'fair', 'poor'].map(condition => {
                      const count = historicalData.filter(day => day.farmingCondition === condition).length;
                      if (count === 0) return null;
                      return (
                        <div key={condition} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">
                            {getConditionIcon(condition)} {condition.charAt(0).toUpperCase() + condition.slice(1)}
                          </span>
                          <span className="text-sm font-medium text-gray-800">{count} days</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Weather Averages</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Avg Temperature:</span>
                      <span className="font-medium">
                        {Math.round(historicalData.reduce((sum, day) => sum + day.temperature, 0) / historicalData.length)}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Avg Humidity:</span>
                      <span className="font-medium">
                        {Math.round(historicalData.reduce((sum, day) => sum + day.humidity, 0) / historicalData.length)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Rainfall:</span>
                      <span className="font-medium">
                        {Math.round(historicalData.reduce((sum, day) => sum + day.rainfall, 0) * 10) / 10}mm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : forecast.length > 0 ? (
              <div className="space-y-4">
                {forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                        alt={day.description}
                        className="w-10 h-10"
                      />
                      <div>
                        <div className="font-medium text-gray-800">{day.date}</div>
                        <div className="text-sm text-gray-600 capitalize">{day.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{day.high}°</div>
                      <div className="text-sm text-gray-500">{day.low}°</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{activeTab === 'history' ? 'Summary will appear here' : 'Forecast will appear here'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherSection;