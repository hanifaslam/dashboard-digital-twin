export interface WeatherApiResponse {
  current?: {
    temperature_2m: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
    is_day: number
    uv_index?: number
  }
  daily?: {
    uv_index_max?: number[]
  }
}

export interface WeatherSummary {
  city: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: string
  uvIndex: number
  isDay: boolean
}
