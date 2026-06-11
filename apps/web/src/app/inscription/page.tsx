import type { Metadata } from "next";
import { AuthForm } from "@/modules/auth/components/AuthForm";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
