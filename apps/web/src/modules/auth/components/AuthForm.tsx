"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "../api";
import { useAuthContext } from "../store";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { login, register } = useAuthContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          password_confirmation: passwordConfirm,
        });
      } else {
        await login(email, password);
      }
      router.push("/");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors);
        if (Object.keys(error.errors).length === 0) {
          setGlobalError(error.message);
        }
      } else {
        setGlobalError("Une erreur est survenue. Réessaie.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-100">
        {isRegister ? "Créer un compte" : "Connexion"}
      </h1>

      {globalError && (
        <p className="mb-5 rounded-md border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {globalError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {isRegister && (
          <Field label="Pseudo" error={errors.name?.[0]}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoComplete="nickname"
            />
          </Field>
        )}

        <Field label="Email" error={errors.email?.[0]}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </Field>

        <Field label="Mot de passe" error={errors.password?.[0]}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </Field>

        {isRegister && (
          <Field label="Confirme le mot de passe">
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </Field>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-red-900 px-4 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-red-800 disabled:opacity-50"
        >
          {submitting ? "…" : isRegister ? "Entrer dans Nexus Noir" : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {isRegister ? (
          <>
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-red-400 hover:text-red-300">
              Connexion
            </Link>
          </>
        ) : (
          <>
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="text-red-400 hover:text-red-300">
              Inscription
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900/70";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}
