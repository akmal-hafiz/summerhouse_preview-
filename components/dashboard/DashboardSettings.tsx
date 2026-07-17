"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FiCheckCircle, FiAlertCircle, FiCalendar } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";
import PasswordInput from "@/components/auth/PasswordInput";

function formatDateID(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

type Feedback = { variant: "success" | "error"; message: string } | null;

export default function DashboardSettings() {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile form
  const [name, setName] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileFeedback(null);
    setProfileSubmitting(true);
    try {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Name cannot be empty");
      await updateProfile(trimmed);
      setProfileFeedback({ variant: "success", message: "Profile updated." });
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      setProfileFeedback({
        variant: "error",
        message: firstError || data?.message || (err as Error).message || "Failed to update profile",
      });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordFeedback(null);
    setPasswordSubmitting(true);
    try {
      if (newPassword.length < 8) throw new Error("New password must be at least 8 characters");
      if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
      const result = await changePassword(currentPassword, newPassword, confirmPassword);
      if (!result.success) throw new Error(result.message || "Failed to change password");
      setPasswordFeedback({
        variant: "success",
        message: result.message || "Password updated. Other devices have been signed out.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      setPasswordFeedback({
        variant: "error",
        message: firstError || data?.message || (err as Error).message || "Failed to change password",
      });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <>
      <section className="dash-hero">
        <div className="dash-hero-copy">
          <h1 className="dash-hero-title">Pengaturan akun</h1>
          <p>Ubah nama atau password. Untuk pindah email, hubungi concierge Summerhouse.</p>
        </div>
        <span className="dash-date-pill">
          {formatDateID(new Date())}
          <span className="dash-date-pill-icon"><FiCalendar aria-hidden="true" /></span>
        </span>
      </section>

      <div className="dash-settings-grid">
        <form className="dash-settings-card" onSubmit={handleProfileSubmit}>
          <h3>Profil</h3>
          <p className="dash-settings-copy">Nama yang muncul di dashboard dan balasan concierge.</p>

          <div className="dash-field">
            <label htmlFor="settings-name">Nama lengkap</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              maxLength={120}
            />
          </div>

          <div className="dash-field">
            <label htmlFor="settings-email">Email</label>
            <input
              id="settings-email"
              type="email"
              value={user?.email ?? ""}
              disabled
              readOnly
              autoComplete="email"
            />
            <p className="dash-field-hint">Pindah email butuh verifikasi concierge.</p>
          </div>

          {profileFeedback && (
            <div className={`dash-feedback dash-feedback--${profileFeedback.variant}`} role={profileFeedback.variant === "error" ? "alert" : "status"}>
              {profileFeedback.variant === "success" ? <FiCheckCircle aria-hidden="true" /> : <FiAlertCircle aria-hidden="true" />}
              <span>{profileFeedback.message}</span>
            </div>
          )}

          <div className="dash-form-actions">
            <button
              type="submit"
              className="dash-submit"
              disabled={profileSubmitting}
              data-loading={profileSubmitting ? "true" : undefined}
            >
              Simpan perubahan
            </button>
          </div>
        </form>

        <form className="dash-settings-card" onSubmit={handlePasswordSubmit}>
          <h3>Password</h3>
          <p className="dash-settings-copy">Minimal 8 karakter. Perangkat lain akan keluar otomatis setelah diubah.</p>

          <div className="dash-field">
            <label htmlFor="settings-current-password">Password sekarang</label>
            <PasswordInput
              id="settings-current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="dash-field">
            <label htmlFor="settings-new-password">Password baru</label>
            <PasswordInput
              id="settings-new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <div className="dash-field">
            <label htmlFor="settings-confirm-password">Konfirmasi password baru</label>
            <PasswordInput
              id="settings-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          {passwordFeedback && (
            <div className={`dash-feedback dash-feedback--${passwordFeedback.variant}`} role={passwordFeedback.variant === "error" ? "alert" : "status"}>
              {passwordFeedback.variant === "success" ? <FiCheckCircle aria-hidden="true" /> : <FiAlertCircle aria-hidden="true" />}
              <span>{passwordFeedback.message}</span>
            </div>
          )}

          <div className="dash-form-actions">
            <button
              type="submit"
              className="dash-submit"
              disabled={passwordSubmitting}
              data-loading={passwordSubmitting ? "true" : undefined}
            >
              Perbarui password
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
