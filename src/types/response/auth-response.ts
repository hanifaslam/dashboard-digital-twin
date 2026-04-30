export interface MeResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  role_id: string;
  role_name: string;
  picture: string;
}

export interface GetCaptchaResponse {
  captcha_id: string;
  image: string;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  picture: null;
}

export interface RegisterResponse {
  user_id: string;
  message: string;
}
