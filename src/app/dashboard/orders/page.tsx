import { requireActiveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/ui";
import { OrdersTable } from "@/components/OrdersTable";

export default async function MerchantOrdersPage() {
  const user = await requireActiveUser();

  const orders = await prisma.order.findMany({
    where: { creatorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { link: true },
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Every payment attempt against your links, with settlement and payout status."
      />
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Share a payment link to start receiving payments."
          cta={{ href: "/dashboard/links", label: "View payment links" }}
        />
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
