export interface RoomEnvironmentResponse {
  room_id: string
  room_name: string
  device_id: string
  device_name: string
  device_type: string
  mqtt_topic: string
  is_online: boolean
  last_seen_at: string
  sensor_type: string
  temperature: number | null
  humidity: number | null
  updated_at: string
}
