import Link from "next/link";
import { requireActiveUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { NewLinkForm } from "./NewLinkForm";

export default async function NewLinkPage() {
  await requireActiveUser();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New payment link"
        subtitle="Define the amount and how it can be paid. You can share the link right after."
        action={
          <Link href="/dashboard/links" className="btn-ghost">
            Cancel
          </Link>
        }
      />
      <div className="card">
        <NewLinkForm />
      </div>
    </div>
  );
}
