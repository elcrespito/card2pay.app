import { Brand } from "@/components/Brand";

export const dynamic = "force-dynamic";

export default async function PayErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>
        <div className="card">
          <h1 className="text-lg font-semibold text-white">
            Payment could not start
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {reason ||
              "We could not start this payment. Please return to the store and try again."}
          </p>
        </div>
        <p className="mt-5 text-xs text-white/30">
          Card2pay is not available to U.S. citizens or residents.
        </p>
      </div>
    </div>
  );
}
