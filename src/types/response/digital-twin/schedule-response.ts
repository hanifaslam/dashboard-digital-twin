export interface ScheduleResponse {
  id: string
  course_name: string
  course_code: string
  start_time: string
  end_time: string
  lecturer_name: string
  is_active?: boolean
}
