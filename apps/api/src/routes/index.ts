import { Elysia } from "elysia";
import orderDetailRoute from "./order/detail.route";
import healthRoute from "./system/health.route";
import pingRoute from "./system/ping.route";

export default new Elysia()
  .use(healthRoute)
  .use(pingRoute)
  .use(orderDetailRoute);
