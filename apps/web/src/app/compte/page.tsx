"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/modules/auth/store";
import { authApi, ApiError } from "@/modules/auth/api";
import type { Badge } from "@/modules/auth/api";
import type { StoryListItem } from "@/lib/api";
import { BadgeIcon } from "@/components/BadgeIcon";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs uppercase tracking-widest text-zinc-600">{children}</p>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDateFR(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ComptePage() {
  const router = useRouter();
  const { user, status, fetchUser } = useAuthContext();

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [readings, setReadings] = useState<StoryListItem[]>([]);
  const [readingsLoading, setReadingsLoading] = useState(true);

  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);

  const [redeemCode, setRedeemCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (status === "guest") {
      router.push("/connexion");
    }
  }, [status, router]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (status !== "authenticated") return;
    authApi
      .readings()
      .then(setReadings)
      .finally(() => setReadingsLoading(false));
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    authApi
      .myBadges()
      .then(setBadges)
      .finally(() => setBadgesLoading(false));
  }, [status]);

  if (status === "loading" || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="text-zinc-700">…</span>
      </div>
    );
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setProfileLoading(true);
    try {
      await authApi.updateProfile({ name: profileName, email: profileEmail });
      await fetchUser();
      setProfileSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const msgs = Object.values(err.errors ?? {}).flat();
        setProfileError(msgs.join(" ") || "Données invalides.");
      } else {
        setProfileError("Une erreur est survenue.");
      }
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordLoading(true);
    try {
      await authApi.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const msgs = Object.values(err.errors ?? {}).flat();
        setPasswordError(msgs.join(" ") || "Données invalides.");
      } else {
        setPasswordError("Une erreur est survenue.");
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleRedeemSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRedeemLoading(true);
    setRedeemResult(null);
    try {
      const res = await authApi.redeemCode(redeemCode);
      if (res.count > 0) {
        setBadges((prev) => [...prev, ...res.awarded]);
        setRedeemResult({
          success: true,
          message: `${res.count} marque${res.count > 1 ? "s" : ""} débloquée${res.count > 1 ? "s" : ""} !`,
        });
        setRedeemCode("");
      } else {
        setRedeemResult({ success: false, message: "Code invalide ou déjà utilisé." });
      }
    } catch {
      setRedeemResult({ success: false, message: "Une erreur est survenue." });
    } finally {
      setRedeemLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {/* En-tête profil */}
      <div className="mb-10 flex items-center gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-950 text-lg font-semibold text-red-300">
          {initials(user.name)}
        </div>
        <div>
          <p className="text-lg font-semibold text-zinc-100">{user.name}</p>
          <p className="text-sm text-zinc-500">{user.roleLabel}</p>
          {user.createdAt && (
            <p className="text-xs text-zinc-600">
              Membre depuis {formatDateFR(user.createdAt)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-10">
        {/* Informations */}
        <section>
          <SectionLabel>Informations</SectionLabel>
          <form
            onSubmit={handleProfileSubmit}
            className="space-y-4 rounded-lg border border-zinc-900 bg-zinc-950/40 p-6"
          >
            <div>
              <label className="mb-1 block text-xs text-zinc-400" htmlFor="profile-name">
                Nom
              </label>
              <input
                id="profile-name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400" htmlFor="profile-email">
                Adresse e-mail
              </label>
              <input
                id="profile-email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                required
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              />
            </div>
            {profileError && <p className="text-sm text-red-500">{profileError}</p>}
            {profileSuccess && (
              <p className="text-sm text-zinc-400">Profil mis à jour.</p>
            )}
            <button
              type="submit"
              disabled={profileLoading}
              className="rounded bg-red-900 px-4 py-2 text-xs uppercase tracking-widest text-zinc-100 transition-colors hover:bg-red-800 disabled:opacity-50"
            >
              Enregistrer
            </button>
          </form>
        </section>

        {/* Mot de passe */}
        <section>
          <SectionLabel>Mot de passe</SectionLabel>
          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4 rounded-lg border border-zinc-900 bg-zinc-950/40 p-6"
          >
            <div>
              <label
                className="mb-1 block text-xs text-zinc-400"
                htmlFor="current-password"
              >
                Mot de passe actuel
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400" htmlFor="new-password">
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs text-zinc-400"
                htmlFor="confirm-password"
              >
                Confirmation
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              />
            </div>
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            {passwordSuccess && (
              <p className="text-sm text-zinc-400">Mot de passe mis à jour.</p>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded bg-red-900 px-4 py-2 text-xs uppercase tracking-widest text-zinc-100 transition-colors hover:bg-red-800 disabled:opacity-50"
            >
              Changer
            </button>
          </form>
        </section>

        {/* Lectures récentes */}
        <section>
          <SectionLabel>Lectures récentes</SectionLabel>
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-6">
            {readingsLoading ? (
              <p className="text-sm text-zinc-700">Chargement…</p>
            ) : readings.length === 0 ? (
              <p className="text-sm text-zinc-600">Aucune lecture enregistrée.</p>
            ) : (
              <ul className="space-y-2">
                {readings.map((story) => (
                  <li key={story.slug}>
                    <Link
                      href={`/nouvelles/${story.slug}`}
                      className="text-sm text-zinc-300 hover:text-red-400"
                    >
                      {story.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Favoris */}
        <section>
          <SectionLabel>Favoris</SectionLabel>
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-4">
            <Link href="/compte/favoris"
              className="text-sm text-zinc-400 hover:text-red-400 transition-colors">
              Voir mes nouvelles favorites →
            </Link>
          </div>
        </section>

        {/* Marques */}
        <section>
          <SectionLabel>Marques</SectionLabel>
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-6">
            {badgesLoading ? (
              <p className="text-sm text-zinc-700">Chargement…</p>
            ) : badges.length === 0 ? (
              <p className="text-sm text-zinc-600">Aucune marque débloquée pour le moment.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {badges.map((badge) => (
                  <div
                    key={badge.slug}
                    className="flex flex-col items-center gap-1 rounded border border-zinc-800 bg-zinc-900/60 p-3"
                    title={badge.description}
                  >
                    <BadgeIcon name={badge.icon} className="h-7 w-7 text-zinc-300" />
                    <span className="text-center text-xs text-zinc-300">{badge.name}</span>
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: badge.rarityColor }}
                    >
                      {badge.rarityLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Code d'accès */}
        <section>
          <SectionLabel>Code d'accès</SectionLabel>
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-6">
            <p className="mb-4 text-sm text-zinc-500">
              Entre un code pour débloquer un badge exclusif.
            </p>
            <form onSubmit={handleRedeemSubmit} className="flex gap-3">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="CODE"
                className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 uppercase tracking-widest outline-none focus:border-red-900"
              />
              <button
                type="submit"
                disabled={redeemLoading || !redeemCode}
                className="rounded bg-red-900 px-4 py-2 text-xs uppercase tracking-widest text-zinc-100 transition-colors hover:bg-red-800 disabled:opacity-50"
              >
                Activer
              </button>
            </form>
            {redeemResult && (
              <p className={`mt-3 text-sm ${redeemResult.success ? "text-zinc-400" : "text-red-500"}`}>
                {redeemResult.message}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
