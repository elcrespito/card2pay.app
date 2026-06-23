import Link from "next/link";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="Card2pay home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-500 text-sm font-bold text-ink-950">
        C2
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">
        Card2pay
      </span>
    </Link>
  );
}
