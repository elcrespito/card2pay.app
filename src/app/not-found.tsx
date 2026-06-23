import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Brand />
      <h1 className="mt-8 text-3xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-white/50">
        The page or payment link you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
