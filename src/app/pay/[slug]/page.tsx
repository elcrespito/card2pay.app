import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Brand } from "@/components/Brand";
import { formatMoney } from "@/lib/format";
import { StartPaymentForm } from "./StartPaymentForm";

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const link = await prisma.paymentLink.findUnique({
    where: { slug },
    include: { creator: { select: { name: true, company: true } } },
  });

  if (!link) notFound();

  const closed =
    link.status !== "ACTIVE"
      ? "This payment link is no longer active."
      : link.type === "ONE_TIME" &&
          (await prisma.order.count({
            where: { linkId: link.id, status: "PAID" },
          })) > 0
        ? "This payment link has already been paid."
        : null;

  const merchant = link.creator.company || link.creator.name;

  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(214,158,46,0.14),transparent)]"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>

        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">
            Payment request from
          </p>
          <p className="mt-0.5 text-base font-semibold text-white">{merchant}</p>

          <div className="my-5 border-y border-white/[0.06] py-5">
            <p className="text-sm text-white/60">{link.title}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
              {formatMoney(link.amount, link.currency)}
            </p>
          </div>

          {closed ? (
            <div className="rounded-lg bg-white/5 px-4 py-6 text-center">
              <p className="text-sm font-medium text-white">{closed}</p>
              <p className="mt-1 text-xs text-white/40">
                Please contact {merchant} if you have questions.
              </p>
            </div>
          ) : (
            <StartPaymentForm slug={link.slug} />
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-white/30">
          Secure card-to-crypto checkout powered by Card2pay. Card2pay is not
          available to U.S. citizens or residents.
        </p>
      </div>
    </div>
  );
}
