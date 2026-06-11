import type { Metadata } from "next";
import { AuthForm } from "@/modules/auth/components/AuthForm";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
