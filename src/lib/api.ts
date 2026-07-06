export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

async function getClerkToken(): Promise<string | null> {
  try {
    const clerk = (window as any).Clerk
    if (clerk?.session) return await clerk.session.getToken()
  } catch {}
  return null
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getClerkToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string>),
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
