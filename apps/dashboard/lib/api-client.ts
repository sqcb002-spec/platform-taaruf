export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...init, credentials: "include", headers: { "content-type": "application/json", ...init?.headers } });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error?.message ?? "Layanan belum dapat dihubungi.");
  return body.data as T;
}
