export interface ListDeviceResponse {
  id: string;
  name: string;
  type: string;
  room_id: string;
  room_name: string;
  status: boolean;
  is_on: boolean;
  power?: string | number;
  created_at: string;
  updated_at: string;
  is_online: boolean;
}
