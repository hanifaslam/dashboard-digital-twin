import { WeatherApiResponse, WeatherSummary } from "@/types/weather"

const WEATHER_CODE_MAP: Record<number, { day: string; night: string }> = {
  0: { day: "Clear sky", night: "Clear night" },
  1: { day: "Mainly clear", night: "Mainly clear" },
  2: { day: "Partly cloudy", night: "Partly cloudy" },
  3: { day: "Overcast", night: "Overcast" },
  45: { day: "Fog", night: "Fog" },
  48: { day: "Rime fog", night: "Rime fog" },
  51: { day: "Light drizzle", night: "Light drizzle" },
  53: { day: "Drizzle", night: "Drizzle" },
  55: { day: "Dense drizzle", night: "Dense drizzle" },
  61: { day: "Light rain", night: "Light rain" },
  63: { day: "Rain", night: "Rain" },
  65: { day: "Heavy rain", night: "Heavy rain" },
  71: { day: "Light snow", night: "Light snow" },
  73: { day: "Snow", night: "Snow" },
  75: { day: "Heavy snow", night: "Heavy snow" },
  80: { day: "Rain showers", night: "Rain showers" },
  81: { day: "Heavy showers", night: "Heavy showers" },
  82: { day: "Violent showers", night: "Violent showers" },
  95: { day: "Thunderstorm", night: "Thunderstorm" },
  96: { day: "Storm with hail", night: "Storm with hail" },
  99: { day: "Severe hailstorm", night: "Severe hailstorm" },
}

function getWeatherCondition(code: number, isDay: boolean) {
  const fallback = { day: "Unknown", night: "Unknown" }
  const entry = WEATHER_CODE_MAP[code] ?? fallback

  return isDay ? entry.day : entry.night
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

export const WeatherService = {
  async getSummary(): Promise<WeatherSummary> {
    const baseUrl =
      process.env.NEXT_PUBLIC_WEATHER_API_URL ?? "https://api.open-meteo.com/v1/forecast"
    const latitude = process.env.NEXT_PUBLIC_WEATHER_LATITUDE ?? "-7.7956"
    const longitude = process.env.NEXT_PUBLIC_WEATHER_LONGITUDE ?? "110.3695"
    const timezone = process.env.NEXT_PUBLIC_WEATHER_TIMEZONE ?? "Asia/Jakarta"
    const city = process.env.NEXT_PUBLIC_WEATHER_CITY ?? "Yogyakarta"

    const url = new URL(baseUrl)
    url.searchParams.set("latitude", latitude)
    url.searchParams.set("longitude", longitude)
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day,uv_index"
    )
    url.searchParams.set("daily", "uv_index_max")
    url.searchParams.set("wind_speed_unit", "kmh")
    url.searchParams.set("temperature_unit", "celsius")
    url.searchParams.set("timezone", timezone)
    url.searchParams.set("forecast_days", "1")

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch weather summary")
    }

    const data = (await response.json()) as WeatherApiResponse
    const current = data.current

    if (!current) {
      throw new Error("Weather summary is unavailable")
    }

    return {
      city,
      temperature: Math.round(current.temperature_2m),
      condition: toTitleCase(
        getWeatherCondition(current.weather_code, current.is_day === 1)
      ),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: current.wind_speed_10m.toFixed(1),
      uvIndex: Math.round(data.daily?.uv_index_max?.[0] ?? current.uv_index ?? 0),
      isDay: current.is_day === 1,
    }
  },
}
