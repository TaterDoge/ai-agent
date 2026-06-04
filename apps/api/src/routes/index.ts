import { Hono } from "hono";
import type { Bindings } from "../env";
import orderDetailRoute from "./order/detail.route";
import healthRoute from "./system/health.route";
import pingRoute from "./system/ping.route";

export default new Hono<{ Bindings: Bindings }>()
  .route("/health", healthRoute)
  .route("/rpc/system/ping", pingRoute)
  .route("/rpc/order/detail", orderDetailRoute);
