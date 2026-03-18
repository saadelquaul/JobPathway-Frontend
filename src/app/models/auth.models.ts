export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  name: string;
}

export interface AdminCreateRequest {
  email: string;
  password: string;
  profilePicture?: string;
}
