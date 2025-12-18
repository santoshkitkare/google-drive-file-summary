import axios from "axios";
import type { LoginResponse, UserProfile } from "../types";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

/** 🔐 Login ONCE */
export async function loginWithGoogle(authCode: string): Promise<string> {
  const res = await axios.post<LoginResponse>(
    `${API_BASE}/auth/login`,
    null,
    { params: { auth_code: authCode } }
  );
  return res.data.session_id;
}

/** 👤 Session-based user fetch */
export async function fetchUserProfile(
  sessionId: string
): Promise<UserProfile> {
  const res = await axios.get<UserProfile>(
    `${API_BASE}/auth/me`,
    { params: { session_id: sessionId } }
  );
  return res.data;
}
