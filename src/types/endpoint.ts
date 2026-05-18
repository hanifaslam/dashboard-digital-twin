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
  },
};
