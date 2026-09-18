export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface HealthResponse {
  status: string;
  message: string;
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: string;
    connected: boolean;
    host: string;
    name: string;
  };
  environment: string;
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/health`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Health check failed with HTTP ${res.status}`);
  }
  return res.json();
}
