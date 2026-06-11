"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/auth";
import { env } from "@/lib/env";

export type AuthState = { error?: string } | undefined;

const signupSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(120),
  company: z.string().max(160).optional(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signupAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company") || undefined,
    email: String(formData.get("email") || "").toLowerCase().trim(),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, company, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      company,
      email,
      passwordHash,
      role: "MERCHANT",
      status: env.requireApproval ? "PENDING" : "ACTIVE",
    },
  });

  await createSession(user.id);
  redirect(user.status === "PENDING" ? "/dashboard/pending" : "/dashboard");
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") || "").toLowerCase().trim(),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password, next } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }
  if (user.status === "SUSPENDED") {
    return { error: "This account has been suspended. Contact support." };
  }

  await createSession(user.id);

  const target =
    user.role === "ADMIN"
      ? "/admin"
      : user.status === "PENDING"
        ? "/dashboard/pending"
        : next && next.startsWith("/")
          ? next
          : "/dashboard";
  redirect(target);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
