import { authClient } from "./auth-client";

export const getTokenFromClient = async (): Promise<string | undefined> => {
  const { data } = await authClient.token();
  const token = data?.token;
  return token;
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const token = await getTokenFromClient();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};