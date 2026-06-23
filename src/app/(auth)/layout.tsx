import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(214,158,46,0.14),transparent)]"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Card2pay ·{" "}
          <Link href="/" className="hover:text-white/60">
            Back to site
          </Link>
        </p>
      </div>
      <SiteFooter compact />
    </div>
  );
}
