export const API_ENDPOINT = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/change-password",
    RESET_PASSWORD: "/auth/reset-password",
    RESET_PASSWORD_VERIFY_TOKEN: "/auth/reset-password/verify",
    ME: "/auth/me",
  },
  USER_MANAGEMENT: {
    ROLE: {
      BASE: "admin/roles",
      SHOW: "admin/roles/:id/show",
      UPDATE: "admin/roles/:id/update",
      UPDATE_STATUS: "admin/roles/:id/status",
      ALL: "admin/roles/all",
      ACCESS_TREE: "admin/roles/access-tree",
    },
    USER: {
      BASE: "admin/users",
      RESET_PASSWORD: "admin/users/:id/reset-password",
      SHOW: "admin/users/:id/show",
      UPDATE: "admin/users/:id/update",
      UPDATE_STATUS: "admin/users/:id/status",
    },
  },
};
