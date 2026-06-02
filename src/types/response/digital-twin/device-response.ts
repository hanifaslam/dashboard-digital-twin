export interface ListDeviceResponse {
  id: string;
  name: string;
  type: string;
  room_id: string;
  room_name: string;
  status: boolean;
  is_on: boolean;
  power?: string | number;
  voltage?: string | number | null;
  current?: string | number | null;
  energy?: string | number | null;
  frequency?: string | number | null;
  power_factor?: string | number | null;
  created_at: string;
  updated_at: string;
  is_online: boolean;
  latest_telemetry?: {
    sensor_type: string;
    voltage: number | null;
    current: number | null;
    power: number | null;
    energy: number | null;
    frequency: number | null;
    power_factor: number | null;
    temperature: number | null;
    humidity: number | null;
    created_at: string;
  } | null;
}
