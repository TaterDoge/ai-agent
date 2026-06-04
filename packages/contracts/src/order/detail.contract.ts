import { z } from "zod";

export const OrderDetailRequestSchema = z.object({
  /** 订单 ID */
  id: z.string().trim().min(1),
});

export const OrderDetailResponseSchema = z.object({
  /** 订单 ID */
  id: z.string(),
  /** 订单编号 */
  orderNo: z.string(),
  /** 订单状态 */
  status: z.string(),
  /** 订单金额（单位：分） */
  totalAmount: z.number().int(),
  /** 实付金额（单位：分） */
  payAmount: z.number().int(),
  /** 下单时间 */
  createdAt: z.string(),
  /** 支付时间 */
  paidAt: z.string().optional(),
  /** 订单商品列表 */
  items: z.array(
    z.object({
      skuId: z.string(),
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().int(),
      image: z.string().optional(),
    })
  ),
});

export type OrderDetailRequest = z.infer<typeof OrderDetailRequestSchema>;
export type OrderDetailResponse = z.infer<typeof OrderDetailResponseSchema>;
