// Centralized environment configuration.
// All env vars are read here once; utils import from this file instead of using process.env directly.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_URL = API_BASE_URL;
export const RTC_API_URL =
  process.env.NEXT_PUBLIC_RTC_API_URL || `${API_BASE_URL}/rtc`;
export const LIVEKIT_URL =
  process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880";
export const RESUME_API_URL =
  process.env.NEXT_PUBLIC_RESUME_API_URL || "http://localhost:10000";

