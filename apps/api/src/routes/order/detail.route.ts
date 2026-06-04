import { zValidator } from "@hono/zod-validator";
import {
  BizCode,
  buildFailure,
  buildSuccess,
  OrderDetailRequestSchema,
} from "@repo/contracts";
import { Hono } from "hono";
import z from "zod";
import type { Bindings } from "../../env";
import { createMeta } from "../../utils/meta";

const detail = new Hono<{ Bindings: Bindings }>();

detail.post(
  "/",
  zValidator("json", OrderDetailRequestSchema, (result, c) => {
    if (result.success) {
      return;
    }

    const res = {
      code: BizCode.COMMON_INVALID_REQUEST,
      message: "Invalid request payload",
      details: z.flattenError(result.error),
    };

    return c.json(buildFailure(res, createMeta()), 400);
  }),
  (c) => {
    const payload = c.req.valid("json");

    // TODO: 替换为真实的订单查询逻辑
    return c.json(
      buildSuccess(
        {
          id: payload.id,
          orderNo: `ORD-${payload.id}-${Date.now()}`,
          status: "paid",
          totalAmount: 9900,
          payAmount: 8800,
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          items: [
            {
              skuId: "SKU-001",
              name: "示例商品",
              quantity: 1,
              price: 9900,
              image: undefined,
            },
          ],
        },
        createMeta()
      )
    );
  }
);

export default detail;
