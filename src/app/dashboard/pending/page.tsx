import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

export default async function PendingPage() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  if (user.status === "ACTIVE") redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-amber-500/15 text-2xl">
        ⏳
      </span>
      <h1 className="text-2xl font-semibold text-white">Account under review</h1>
      <p className="mt-3 text-sm text-white/50">
        Thanks for signing up, {user.name.split(" ")[0]}. Your account is being
        reviewed by our team. You&apos;ll be able to create payment links as soon
        as it&apos;s approved — we&apos;ll notify you at{" "}
        <span className="text-white/80">{user.email}</span>.
      </p>
      <div className="mt-6 w-40">
        <LogoutButton />
      </div>
    </div>
  );
}
