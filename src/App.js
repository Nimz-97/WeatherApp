import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('London');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localTime, setLocalTime] = useState({
    time: '',
    date: '',
    sunrise: '',
    sunset: ''
  });

  const calculateLocalTime = (timezone, sunrise, sunset) => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utcTime + (timezone * 1000));
    
    return {
      time: cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      date: cityTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      sunrise: new Date((sunrise + timezone) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      sunset: new Date((sunset + timezone) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (weather) {
        setLocalTime(calculateLocalTime(weather.timezone, weather.sys.sunrise, weather.sys.sunset));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [weather]);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}?q=${city}&appid=${process.env.REACT_APP_API_KEY}&units=metric`
      );
      setWeather(response.data);
      setLocalTime(calculateLocalTime(response.data.timezone, response.data.sys.sunrise, response.data.sys.sunset));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) fetchWeather();
  };

  return (
    <div className="app">
      <h1>WEATHER AND TIME APP</h1>
      <form onSubmit={handleSubmit} className="search-box">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button type="submit">Search</button>
      </form>

      {error && <p className="error">Error: {error}</p>}
      
      <div className="dashboard-container">
        {loading && (
          <div className="weather-loading-overlay">
            <div className="weather-animation">
              <div className="sun"></div>
              <div className="cloud"></div>
              <div className="rain">
                {[...Array(10)].map((_, i) => <div key={i} className="drop"></div>)}
              </div>
            </div>
            <p>Updating weather...</p>
          </div>
        )}
        
        <div className={`dashboard ${loading ? 'loading' : ''}`}>
          <div className="weather-panel">
            <div className="location">
              <h2>{weather ? `${weather.name}, ${weather.sys.country}` : '--'}</h2>
              <img 
                src={weather ? `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` : ''} 
                alt={weather ? weather.weather[0].description : ''} 
              />
            </div>
            
            <div className="weather-info">
              <div className="temp">{weather ? `${Math.round(weather.main.temp)}°C` : '--°C'}</div>
              <div className="desc">{weather ? weather.weather[0].description : '--'}</div>
              
              <div className="details">
                <div className="detail-item">
                  <span>Feels like</span>
                  <span>{weather ? `${Math.round(weather.main.feels_like)}°C` : '--'}</span>
                </div>
                <div className="detail-item">
                  <span>Humidity</span>
                  <span>{weather ? `${weather.main.humidity}%` : '--'}</span>
                </div>
                <div className="detail-item">
                  <span>Wind</span>
                  <span>{weather ? `${weather.wind.speed} m/s` : '--'}</span>
                </div>
                <div className="detail-item">
                  <span>Pressure</span>
                  <span>{weather ? `${weather.main.pressure} hPa` : '--'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="time-panel">
            <div className="digital-clock">{localTime.time || '--:--:--'}</div>
            <div className="date">{localTime.date || '--'}</div>
            
            <div className="sun-times">
              <div className="sun-time">
                <span>☀️ Sunrise</span>
                <span>{localTime.sunrise || '--:--'}</span>
              </div>
              <div className="sun-time">
                <span>🌙 Sunset</span>
                <span>{localTime.sunset || '--:--'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="copyright">
        © {new Date().getFullYear()} Weather App. All rights reserved.
        <div className="api-credit">Powered by OpenWeatherMap API</div>
      </footer>
    </div>
  );
}

export default App;