/**
 * JWT Authentication Management for Rentora
 * Handles access token storage, retrieval, generation and authorization headers
 */

export const JWT_STORAGE_KEY = "rentora_access_token";

const serverApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface JwtUserPayload {
  id: string;
  email: string;
  name?: string;
  role: string;
}

/**
 * Store the JWT access token in localStorage and cookies for client/server access
 */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(JWT_STORAGE_KEY, token);
    // Also set cookie so Next.js middleware or server components can access if needed
    document.cookie = `${JWT_STORAGE_KEY}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to persist access token in storage:", e);
  }
}

/**
 * Retrieve the current JWT access token
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const local = localStorage.getItem(JWT_STORAGE_KEY);
    if (local) return local;

    // Fallback: parse from document.cookie
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${JWT_STORAGE_KEY}=`));
    return match ? match.split("=")[1] : null;
  } catch {
    return null;
  }
}

/**
 * Clear the JWT access token upon logout
 */
export function removeAccessToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(JWT_STORAGE_KEY);
    document.cookie = `${JWT_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    // Notify server to clear cookie
    fetch(`${serverApiUrl}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  } catch (e) {
    console.error("Failed to remove access token:", e);
  }
}

/**
 * Decode JWT token client-side without external dependencies
 */
export function parseJwt(token: string): JwtUserPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Request an access token from the backend server upon successful login
 */
export async function generateJwtAccessToken(user: {
  email: string;
  id?: string;
  name?: string;
  role?: string;
}): Promise<string | null> {
  try {
    const res = await fetch(`${serverApiUrl}/api/auth/jwt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (!res.ok) {
      console.warn("Server returned non-200 for JWT generation");
      return null;
    }

    const data = await res.json();
    if (data?.token) {
      setAccessToken(data.token);
      return data.token;
    }
    return null;
  } catch (err) {
    console.error("Failed to request JWT access token:", err);
    return null;
  }
}

/**
 * Returns Authorization header with Bearer token if available
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Ensures a valid JWT access token is present, generating or refreshing it if missing.
 */
export async function ensureAccessToken(user?: {
  email?: string | null;
  id?: string | null;
  name?: string | null;
  role?: string | null;
}): Promise<string | null> {
  let token = getAccessToken();
  if (token) return token;

  if (user?.email) {
    token = await generateJwtAccessToken({
      email: user.email,
      id: user.id || undefined,
      name: user.name || undefined,
      role: user.role || undefined,
    });
  }
  return token;
}
