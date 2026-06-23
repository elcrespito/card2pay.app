import { logoutAction } from "@/app/(auth)/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
      >
        Sign out
      </button>
    </form>
  );
}
