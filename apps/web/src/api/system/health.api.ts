import type { ApiResponse } from "@repo/contracts";
import { http } from "@/http";

export function getHealth(): Promise<
  ApiResponse<{ service: string; env: string }>
> {
  return http.get<{ service: string; env: string }>("/health");
}
