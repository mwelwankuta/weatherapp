import { Redis } from "@upstash/redis";
import { SearchHistoryItem } from "@weather-app/shared";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;
const WEATHERBIT_BASE_URL = process.env.WEATHERBIT_BASE_URL;

console.log(WEATHERBIT_API_KEY, WEATHERBIT_BASE_URL)

app.use(cors());
app.use(express.json());

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function getOrSetCache<T>(key: string, cb: () => Promise<T>): Promise<T> {
  const cachedData = await redis.get(key);
  if (cachedData) {
    return JSON.parse(cachedData as string) as T;
  }

  const freshData = await cb();
  await redis.set(key, JSON.stringify(freshData), { ex: 600 }); // Cache for 10 minutes
  return freshData;
}

app.get("/api/current/:city/:country", async (req, res) => {
  try {
    const { city, country } = req.params;
    console.log(city, country)
    const cacheKey = `current:${city}:${country}`;

    const currentWeather = await getOrSetCache(cacheKey, async () => {
      const response = await axios.get(`${WEATHERBIT_BASE_URL}/current`, {
        params: {
          city: city,
          country: country,
          key: WEATHERBIT_API_KEY,
        },
      });
      return JSON.stringify(response.data.data[0]);
    });

    const searchItem: SearchHistoryItem = {
      city,
      country,
      timestamp: new Date(),
    };

    await redis.lpush("search_history", JSON.stringify(searchItem));
    await redis.ltrim("search_history", 0, 4); // Keep only the last 5 searches

    res.send(currentWeather);
  } catch (error) {
    console.log(error, "ERR");
    res.status(500).send({ error: "Error fetching current weather data" });
  }
});

app.get("/api/forecast/:city/:country", async (req, res) => {
  try {
    const { city, country } = req.params;
    const cacheKey = `forecast:${city}:${country}`;

    const forecast = await getOrSetCache(cacheKey, async () => {
      const response = await axios.get(
        `${WEATHERBIT_BASE_URL}/forecast/daily`,
        {
          params: {
            city: city,
            country: country,
            key: WEATHERBIT_API_KEY,
            days: 16,
          },
        }
      );
      return JSON.stringify(response.data.data);
    });

    res.send(forecast);
  } catch (error) {
    res.status(500).send({ error: "Error fetching forecast data" });
  }
});

app.get("/api/history", async (req, res) => {
  try {
    const history = await redis.lrange("search_history", 0, -1);
    const parsedHistory: SearchHistoryItem[] = history.map((item) =>
      JSON.parse(item)
    );
    res.send(parsedHistory);
  } catch (error) {
    res.status(500).send({ error: "Error fetching search history" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
