import { CurrentWeather, ForecastDay } from "@weather-app/shared";
import axios from "axios";
import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not set");
}

function App() {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  return (
    <div className="container mx-auto p-4 flex flex-col">
      {submitted === false && (
        <div className="flex flex-col self-center">
          <h1 className="text-3xl font-bold mb-4">Weather App</h1>
          <form
            onSubmit={async (e: React.FormEvent) => {
              setLoading(true);
              e.preventDefault();
              await fetchCurrentWeather();
              await fetchForecast();

              setSubmitted(true);
              setLoading(false);
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
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </form>
        </div>
      )}
      {submitted === true && (
        <button
          onClick={() => setSubmitted(false)}
          className="text-semibold bg-gray-100 rounded-md px-4 py-2"
        >
          Back
        </button>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {currentWeather && submitted === true && (
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

      {forecast && submitted === true && (
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
    </div>
  );
}

export default App;
