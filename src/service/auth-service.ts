import { api } from "@/lib/axios";
import { AuthInput, RegisterInput, ResetPasswordFormValues } from "@/schema/auth-schema";

import { BaseResponse } from "@/types/base-api";
import { API_ENDPOINT } from "@/types/endpoint";
import { LoginResponse, MeResponse, RegisterResponse } from "@/types/response/auth-response";

function getResponseData<T>(response: BaseResponse<T>) {
  const data = response.data as T | T[];
  return Array.isArray(data) ? data[0] : data;
}

export const AuthService = {
  login: async (data: AuthInput) => {
    const response = await api.post<LoginResponse, AuthInput>(
      API_ENDPOINT.AUTH.LOGIN,
      data,
    );
    return getResponseData(response);
  },

  register: async (data: RegisterInput) => {
    const response = await api.post<RegisterResponse, RegisterInput>(
      API_ENDPOINT.AUTH.REGISTER,
      data
    );
    return response; // Register usually returns BaseResponse directly or we can use getResponseData if needed
  },

  resetPassword: async (data: ResetPasswordFormValues & { token?: string }) => {
    const response = await api.put<MeResponse, ResetPasswordFormValues & { token?: string }>(
      API_ENDPOINT.AUTH.RESET_PASSWORD,
      data
    )
    return getResponseData(response)
  },

  verifyResetToken: async (data: { token: string }) => {
    const response = await api.post<{ valid: boolean }>(
      API_ENDPOINT.AUTH.RESET_PASSWORD_VERIFY_TOKEN,
      data
    )
    return getResponseData(response)
  },

  me: async () => {
    const response = await api.get<MeResponse>(API_ENDPOINT.AUTH.ME);
    return getResponseData(response);
  },

  logout: async () => {
    const response = await api.post<void>(API_ENDPOINT.AUTH.LOGOUT);
    return response;
  },
};
