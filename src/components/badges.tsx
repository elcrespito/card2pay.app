import type {
  OrderStatus,
  PayoutStatus,
  UserStatus,
  LinkStatus,
  LinkType,
} from "@prisma/client";

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return <span className={`badge ${className}`}>{children}</span>;
}

const ORDER_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-white/10 text-white/70",
  WAITING: "bg-amber-500/15 text-amber-300",
  CONFIRMING: "bg-sky-500/15 text-sky-300",
  PARTIALLY_PAID: "bg-orange-500/15 text-orange-300",
  PAID: "bg-emerald-500/15 text-emerald-300",
  FAILED: "bg-red-500/15 text-red-300",
  EXPIRED: "bg-zinc-500/15 text-zinc-300",
  REFUNDED: "bg-purple-500/15 text-purple-300",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={ORDER_STYLES[status]}>{status.replace("_", " ")}</Badge>;
}

const PAYOUT_STYLES: Record<PayoutStatus, string> = {
  UNPAID: "bg-red-500/15 text-red-300",
  PROCESSING: "bg-amber-500/15 text-amber-300",
  SENT: "bg-emerald-500/15 text-emerald-300",
};

export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  return <Badge className={PAYOUT_STYLES[status]}>{status}</Badge>;
}

const USER_STYLES: Record<UserStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-300",
  ACTIVE: "bg-emerald-500/15 text-emerald-300",
  SUSPENDED: "bg-red-500/15 text-red-300",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge className={USER_STYLES[status]}>{status}</Badge>;
}

export function LinkStatusBadge({ status }: { status: LinkStatus }) {
  return (
    <Badge
      className={
        status === "ACTIVE"
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-zinc-500/15 text-zinc-300"
      }
    >
      {status}
    </Badge>
  );
}

export function LinkTypeBadge({ type }: { type: LinkType }) {
  return (
    <Badge
      className={
        type === "ONE_TIME"
          ? "bg-sky-500/15 text-sky-300"
          : "bg-violet-500/15 text-violet-300"
      }
    >
      {type === "ONE_TIME" ? "One-time" : "Reusable"}
    </Badge>
  );
}
