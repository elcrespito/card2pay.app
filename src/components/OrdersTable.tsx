import type { Order, PaymentLink, MerchantSite, User } from "@prisma/client";
import { OrderStatusBadge, PayoutStatusBadge } from "@/components/badges";
import { formatMoney, formatCrypto, formatDate, truncateMiddle } from "@/lib/format";

type OrderRow = Order & {
  link?: PaymentLink | null;
  site?: Pick<MerchantSite, "name"> | null;
  creator?: Pick<User, "name" | "email"> | null;
};

export function OrdersTable({
  orders,
  showCreator = false,
  action,
}: {
  orders: OrderRow[];
  showCreator?: boolean;
  action?: (order: OrderRow) => React.ReactNode;
}) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[760px]">
        <thead className="border-b border-white/[0.06]">
          <tr>
            <th className="table-th">Order</th>
            <th className="table-th">Source</th>
            {showCreator ? <th className="table-th">Merchant</th> : null}
            <th className="table-th">Amount</th>
            <th className="table-th">Deposit</th>
            <th className="table-th">Status</th>
            <th className="table-th">Payout</th>
            <th className="table-th">Created</th>
            {action ? <th className="table-th text-right">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="table-td">
                <span className="font-mono text-xs text-white">{o.reference}</span>
                {o.payerEmail ? (
                  <span className="mt-0.5 block text-[11px] text-white/40">
                    {o.payerEmail}
                  </span>
                ) : null}
              </td>
              <td className="table-td">
                {o.link ? (
                  o.link.title
                ) : o.site ? (
                  <span>
                    {o.site.name}
                    {o.externalOrderId ? (
                      <span className="block text-[11px] text-white/40">
                        #{o.externalOrderId}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  o.description ?? "—"
                )}
              </td>
              {showCreator ? (
                <td className="table-td">
                  <span className="block text-white/80">{o.creator?.name}</span>
                  <span className="block text-[11px] text-white/40">
                    {o.creator?.email}
                  </span>
                </td>
              ) : null}
              <td className="table-td">{formatMoney(o.amount, o.currency)}</td>
              <td className="table-td">
                {o.payAddress ? (
                  <span className="font-mono text-[11px] text-white/60">
                    {formatCrypto(o.payAmount, o.payCurrency ?? "")}
                    <span className="block text-white/35">
                      {truncateMiddle(o.payAddress)}
                    </span>
                  </span>
                ) : (
                  <span className="text-white/30">—</span>
                )}
              </td>
              <td className="table-td">
                <OrderStatusBadge status={o.status} />
              </td>
              <td className="table-td">
                {o.status === "PAID" ? (
                  <PayoutStatusBadge status={o.payoutStatus} />
                ) : (
                  <span className="text-white/30">—</span>
                )}
              </td>
              <td className="table-td whitespace-nowrap text-white/50">
                {formatDate(o.createdAt)}
              </td>
              {action ? <td className="table-td text-right">{action(o)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
