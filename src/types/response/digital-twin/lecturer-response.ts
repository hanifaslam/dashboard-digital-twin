export interface LecturerResponse {
  id: string
  name: string
  nip: string
  status: string
  room_type: string
  course: string | null
  present_since: string | null
  phone_number?: string | null
}
