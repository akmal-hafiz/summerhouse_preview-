"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";
import PasswordInput from "@/components/auth/PasswordInput";
import DashboardAvatar from "./DashboardAvatar";

type Feedback = { variant: "success" | "error"; message: string } | null;

export default function DashboardSettings() {
  const { user, updateProfile, changePassword, uploadAvatar, removeAvatar, logout } = useAuth();
  const router = useRouter();
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState<Feedback>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); }, [avatarPreview]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setAvatarFeedback(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setAvatarFeedback({ variant: "error", message: "Choose a JPEG, PNG or WebP image under 3 MB." });
      input.value = "";
      return;
    }
    setAvatarBusy(true);
    setAvatarPreview(URL.createObjectURL(file));
    try {
      await uploadAvatar(file);
      setAvatarFeedback({ variant: "success", message: "Profile photo updated." });
    } catch (error) {
      setAvatarFeedback({ variant: "error", message: error instanceof Error ? error.message : "Could not upload photo." });
    } finally {
      setAvatarPreview(null);
      setAvatarBusy(false);
      input.value = "";
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarBusy(true);
    setAvatarFeedback(null);
    try {
      await removeAvatar();
      setAvatarFeedback({ variant: "success", message: "Profile photo removed." });
    } catch (error) {
      setAvatarFeedback({ variant: "error", message: error instanceof Error ? error.message : "Could not remove photo." });
    } finally {
      setAvatarBusy(false);
    }
  };

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
      <header className="dash-page-intro dash-page-intro--inner">
        <h1>Account settings</h1>
        <p>Manage the details you use with Summerhouses.</p>
      </header>

      <div className="dash-settings-grid">
        <form className="dash-settings-card" onSubmit={handleProfileSubmit}>
          <h3>Profile</h3>
          <p className="dash-settings-copy">The name shown in your Summerhouses account.</p>

          <div className="dash-avatar-setting">
            <DashboardAvatar name={user?.name || "Guest"} src={avatarPreview || user?.avatarUrl} />
            <div>
              <span className="dash-avatar-setting-title">Profile photo</span>
              <p>Optional. We crop your photo to a square.</p>
              <div className="dash-avatar-actions">
                <label className="dash-avatar-upload" htmlFor="settings-avatar">{avatarBusy ? "Saving..." : user?.avatarUrl ? "Change photo" : "Add photo"}</label>
                <input id="settings-avatar" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} disabled={avatarBusy} />
                {user?.avatarUrl && <button type="button" onClick={handleAvatarRemove} disabled={avatarBusy}>Remove</button>}
              </div>
            </div>
          </div>
          {avatarFeedback && <p className={`dash-feedback dash-feedback--${avatarFeedback.variant}`} role={avatarFeedback.variant === "error" ? "alert" : "status"}>{avatarFeedback.message}</p>}

          <div className="dash-field">
            <label htmlFor="settings-name">Full name</label>
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
            <p className="dash-field-hint">To change your email address, please contact our team.</p>
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
              Save changes
            </button>
          </div>
        </form>

        <form className="dash-settings-card" onSubmit={handlePasswordSubmit}>
          <h3>Password</h3>
          <p className="dash-settings-copy">Use at least eight characters. Other sessions will be signed out after a change.</p>

          <div className="dash-field">
            <label htmlFor="settings-current-password">Current password</label>
            <PasswordInput
              id="settings-current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="dash-field">
            <label htmlFor="settings-new-password">New password</label>
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
            <label htmlFor="settings-confirm-password">Confirm new password</label>
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
              Update password
            </button>
          </div>
        </form>
      </div>
      <div className="dash-mobile-account-actions">
        <Link href="/">Back to site</Link>
        <button type="button" onClick={async () => { await logout(); router.push("/"); router.refresh(); }}>Sign out</button>
      </div>
    </>
  );
}
