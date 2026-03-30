import Link from "next/link";

import { LogoutButton } from "@/components/auth";
import { Badge } from "@/components/shared/ui";
import { Card } from "@/components/shared/ui";
import { getSessionToken, requireUser } from "@/lib/auth/server";
import { getOrders } from "@/lib/orders";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import { formatCurrency, formatDate } from "@/lib/shared/utils";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const token = await getSessionToken();
  const { orders } = await getOrders(token as string);

  return (
    <div className="cc-grid space-y-8 py-10">
      <section className="grid gap-6">
        <Card className="space-y-5 p-7">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-foreground">
              {user.nickname}
            </h1>
          </div>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>{user.email}</p>
            <p>판매자 프로필 ID: {user.sellerProfileId}</p>
            {user.shopName ? <p>상점명: {user.shopName}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/seller"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-secondary px-5 text-sm font-semibold text-white"
            >
              Seller Hub
            </Link>
            <LogoutButton />
          </div>
        </Card>
        <Card className="p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-secondary">
            Recent orders
          </p>
          <div className="mt-5 space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}/success`}
                className="block rounded-[1.5rem] bg-surface-sunken px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-bold text-foreground">#{order.id}</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {formatDate(order.createdAt)} · {order.items.length}개 상품
                    </p>
                  </div>
                  <Badge tone="cyan">{ORDER_STATUS_LABELS[order.status]}</Badge>
                </div>
                <p className="mt-4 text-lg font-black tracking-[-0.04em] text-brand-primary">
                  {formatCurrency(order.finalAmount)}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
