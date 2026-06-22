export const API_ENDPOINT = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/change-password",
    RESET_PASSWORD: "/auth/reset-password",
    RESET_PASSWORD_VERIFY_TOKEN: "/auth/reset-password/verify",
    ME: "/auth/me",
  },
  DIGITAL_TWIN: {
    LECTURER: {
      BASE: "dashboard/rooms/:id/lecturers",
    },
    SCHEDULE: {
      BASE: "dashboard/rooms/:id/schedules",
    },
    ROOM: {
      BASE: "dashboard/rooms/:id",
    },
    ROOM_ENVIRONMENT: {
      BASE: "sensors/environment/room/:roomId",
    },
    DEVICE: {
      BASE: "devices",
      CONTROL: "devices/:id/control",
      CCTV_STREAMS: "devices/cctv/streams",
    },
  },
  DASHBOARD: {
    BUILDINGS: "/dashboard/buildings",
    DEVICE_LIVE_SUMMARY: "/dashboard/device-live-summary",
    ENERGY_MONITORING_SUMMARY: "/dashboard/energy-monitoring-summary",
    LIVE_ACTIVITY_LOG: "/dashboard/live-activity-log",
    CHATBOT: "/dashboard/chatbot",
  },
};
