import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Brand } from "@/components/Brand";
import { formatMoney, formatCrypto } from "@/lib/format";
import { OrderStatusWatcher } from "./OrderStatusWatcher";

export const dynamic = "force-dynamic";

export default async function OrderCheckoutPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  const order = await prisma.order.findUnique({
    where: { reference },
    include: {
      link: { include: { creator: { select: { name: true, company: true } } } },
      site: { select: { name: true } },
    },
  });

  if (!order) notFound();

  const merchant = order.link
    ? order.link.creator.company || order.link.creator.name
    : order.site?.name || "Merchant";
  const title = order.link?.title || order.description || "Payment";
  const widgetParams = new URLSearchParams();
  if (order.payAmount) widgetParams.set("amount", order.payAmount.toString());
  if (order.payAddress) widgetParams.set("wallet", order.payAddress);
  if (order.payerEmail) {
    widgetParams.set("email", order.payerEmail);
    widgetParams.set("external_user_email", order.payerEmail);
  }
  widgetParams.set("auto", "1");
  const widgetSrc = `/widget.html?${widgetParams.toString()}`;

  const alreadyPaid = order.status === "PAID";

  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 py-8">
      <div className="relative w-full max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <Brand />
          <span className="font-mono text-xs text-white/40">{order.reference}</span>
        </div>

        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">
                Paying {merchant}
              </p>
              <p className="mt-0.5 text-sm text-white/70">{title}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-white">
                {formatMoney(order.amount, order.currency)}
              </p>
              {order.payAmount ? (
                <p className="text-xs text-white/40">
                  ≈ {formatCrypto(order.payAmount, order.payCurrency ?? "")}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <OrderStatusWatcher
          reference={order.reference}
          initialStatus={order.status}
          returnUrl={order.returnUrl ?? undefined}
        />

        {!alreadyPaid && order.payAddress ? (
          <div className="card overflow-hidden p-0">
            <iframe
              src={widgetSrc}
              title="Card2pay secure checkout"
              className="h-[680px] w-full border-0"
              allow="clipboard-write; payment"
            />
          </div>
        ) : null}

        <p className="mt-5 text-center text-xs text-white/30">
          Card2pay is not available to U.S. citizens or residents. Your order
          updates automatically once payment is confirmed.
        </p>
      </div>
    </div>
  );
}
