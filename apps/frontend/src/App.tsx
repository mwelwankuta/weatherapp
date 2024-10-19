import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CurrentWeather,
  ForecastDay,
  SearchHistoryItem,
} from "@weather-app/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not set");
}

function App() {
  const [city, setCity] = useState("Lusaka");
  const [country, setCountry] = useState("ZM");
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(
    null
  );
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      await fetchLocation();
    })();
  }, []);

  const fetchLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const locationResponse = await axios.get(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const { city, countryCode } = locationResponse.data;
            setCity(city);
            setCountry(countryCode);
          } catch (err) {
            setError("Error fetching location data");
            console.error("Error fetching location data:", err);
          }
        },
        () => {
          setError("Error getting your location");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const fetchCurrentWeather = async () => {
    try {
      const response = await axios.get<CurrentWeather>(
        `${API_BASE_URL}/current/${city}/${country}`
      );
      setCurrentWeather(response.data);
      setError("");
    } catch (error) {
      setError("Error fetching current weather data");
      console.error("Error fetching weather data:", error);
    }
  };

  const fetchForecast = async () => {
    try {
      const response = await axios.get<ForecastDay[]>(
        `${API_BASE_URL}/forecast/${city}/${country}`
      );
      setForecast(response.data);
      console.log(response.data, "fetchForecast");
      setError("");
    } catch (error) {
      setError("Error fetching forecast data");
      console.error("Error fetching forecast data:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get<SearchHistoryItem[]>(
        `${API_BASE_URL}/history`
      );
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Weather App</h1>
      <form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          fetchCurrentWeather();
          fetchForecast();
          fetchHistory();
        }}
        className="mb-4"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country Code"
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Search
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {currentWeather && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold">
            Current Weather in {currentWeather.city_name},{" "}
            {currentWeather.country_code}
          </h2>
          <p>Temperature: {currentWeather.temp}°C</p>
          <p>Feels like: {currentWeather.app_temp}°C</p>
          <p>Weather: {currentWeather.weather.description}</p>
          <img
            src={`https://www.weatherbit.io/static/img/icons/${currentWeather.weather.icon}.png`}
            alt="Weather icon"
            className="w-16 h-16"
          />
          <p>Wind Speed: {currentWeather.wind_spd.toFixed(1)} m/s</p>
          <p>Humidity: {currentWeather.rh}%</p>
          <p>Air Quality Index: {currentWeather.aqi}</p>
          <p>
            Observation Time:{" "}
            {new Date(currentWeather.ob_time).toLocaleString()}
          </p>
        </div>
      )}

      {forecast && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold">16-Day Forecast</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {forecast.map((day) => (
              <div key={day.datetime} className="border p-2 rounded">
                <p className="font-bold">
                  {new Date(day.datetime).toLocaleDateString()}
                </p>
                <img
                  src={`https://www.weatherbit.io/static/img/icons/${day.weather.icon}.png`}
                  alt="Weather icon"
                  className="w-12 h-12"
                />
                <p>Max: {day.max_temp.toFixed(1)}°C</p>
                <p>Min: {day.min_temp.toFixed(1)}°C</p>
                <p>{day.weather.description}</p>
                <p>Precipitation: {day.precip.toFixed(1)}mm</p>
                <p>UV Index: {day.uv.toFixed(1)}</p>
                <p>
                  Wind: {day.wind_cdir_full} at {day.wind_spd.toFixed(1)}m/s
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold">Search History</h2>
        <ul>
          {history.map((item, index) => (
            <li key={index} className="mb-2">
              {item.city}, {item.country} -{" "}
              {new Date(item.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
