export interface DashboardBuilding {
  id: string;
  name: string;
}

export interface DeviceLiveSummary {
  active_devices: number;
  latency_ms: number | null;
  latency: string;
  last_sync: string;
}

export interface EnergyTrendPoint {
  timestamp: string;
  total_power: number;
}

export interface EnergyMonitoringSummary {
  building_id: string;
  building_name: string;
  current_active_demand_watts: number;
  current_active_demand_label: string;
  change_percent_vs_average: number;
  trend_window_seconds: number;
  trend: EnergyTrendPoint[];
  last_updated_at: string | null;
}

export interface ActivityLogItem {
  id: string;
  category: string;
  message: string;
  created_at: string;
  time_label: string;
}

export interface DashboardApiResponse<T> {
  success: boolean;
  message: string;
  metadata: Record<string, unknown>;
  data: T;
}

export interface DashboardChatbotRequest {
  message: string;
  building_id?: string;
  room_id?: string;
  session_id: string;
}

export interface DashboardChatbotContextScope {
  building_id: string | null;
  room_id: string | null;
}

export interface DashboardChatbotMetadata {
  rejected?: boolean;
  model?: string;
  provider?: string;
  used_memory?: boolean;
}

export interface DashboardChatbotData {
  session_id: string;
  reply: string;
  intent: string;
  context_scope: DashboardChatbotContextScope;
}

export interface DashboardChatbotResponse {
  success: boolean;
  message: string;
  metadata: DashboardChatbotMetadata;
  data: DashboardChatbotData | null;
}
