export interface CurrentWeather {
  city_name: string;
  country_code: string;
  temp: number;
  app_temp: number;
  weather: {
    icon: string;
    description: string;
  };
  wind_spd: number;
  rh: number;
  aqi: number;
  ob_time: string;
}

export interface ForecastDay {
  datetime: string;
  max_temp: number;
  min_temp: number;
  weather: {
    icon: string;
    description: string;
  };
  precip: number;
  uv: number;
  wind_cdir_full: string;
  wind_spd: number;
}

export interface SearchHistoryItem {
  city: string;
  country: string;
  timestamp: Date;
}
