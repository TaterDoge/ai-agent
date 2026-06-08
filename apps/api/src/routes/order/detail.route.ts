import { buildSuccess, OrderDetailRequestSchema } from "@repo/contracts";
import { Elysia } from "elysia";
import { createMeta } from "../../utils/meta";
import { validateBody } from "../../utils/validate";

const detail = new Elysia({ prefix: "/rpc/order/detail" });

detail.post("/", ({ body }) => {
  const payload = validateBody(OrderDetailRequestSchema, body);

  // TODO: 替换为真实的订单查询逻辑
  return buildSuccess(
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
  );
});

export default detail;
