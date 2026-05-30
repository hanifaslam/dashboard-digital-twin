export interface MeStudyProgramResponse {
  id: string;
  name: string;
}

export interface MeBuildingResponse {
  id: string;
  name: string;
}

export interface Access {
  id: string;
  name: string;
  code: string;
  children?: Access[];
}

export interface MeResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  role_name: string;
  role_id: string;
  role_code: string | null;
  lecturer_id: string | null;
  nip: string | null;
  study_programs: MeStudyProgramResponse[];
  buildings: MeBuildingResponse[];
  access: Access[];
  picture?: string | null;
  profile_picture?: string | null;
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

