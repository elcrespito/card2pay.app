import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");

  const { next } = await searchParams;

  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-white">Sign in</h1>
      <p className="mt-1 text-sm text-white/50">
        Access your dashboard to create and track payment links.
      </p>
      <div className="mt-6">
        <LoginForm next={next} />
      </div>
      <p className="mt-6 text-center text-sm text-white/50">
        New to Card2pay?{" "}
        <Link href="/signup" className="font-medium text-gold-400 hover:text-gold-300">
          Create an account
        </Link>
      </p>
    </div>
  );
}
