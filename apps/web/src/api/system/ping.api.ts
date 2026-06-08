import type { ApiResponse, PingRequest, PingResponse } from "@repo/contracts";
import { http } from "@/http";

export function postPing(
  payload: PingRequest
): Promise<ApiResponse<PingResponse>> {
  return http.post<PingRequest, PingResponse>("/rpc/system/ping", payload);
}
