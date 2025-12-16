export interface LoginResponse {
  session_id: string;
}

export interface UserProfile {
  name: string;
  email: string;
  picture?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}
