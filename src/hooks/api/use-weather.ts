import { useQuery } from "@tanstack/react-query"

import { WeatherService } from "@/service/weather-service"

export function useWeatherSummaryQuery() {
  return useQuery({
    queryKey: ["weather-summary"],
    queryFn: () => WeatherService.getSummary(),
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 15,
    retry: 1,
  })
}
