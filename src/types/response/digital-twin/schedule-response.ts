export interface ScheduleResponse {
  id: string
  course_name: string
  course_code: string
  class_id: string
  class_name: string
  start_time: string
  end_time: string
  is_online: boolean
  lecturer_name: string
  is_active?: boolean
  is_passed?: boolean
  is_upcoming?: boolean
}
