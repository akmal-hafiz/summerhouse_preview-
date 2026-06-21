import "@/components/auth/auth-page.css";
import GoogleCompleteClient from "./GoogleCompleteClient";

export const metadata = {
  title: "Completing sign-in… — Summerhouses",
  robots: { index: false, follow: false },
};

export default function GoogleCompletePage() {
  return (
    <div className="auth-shell" style={{ gridTemplateColumns: "1fr" }}>
      <aside className="auth-left">
        <div className="auth-form-wrap">
          <GoogleCompleteClient />
        </div>
      </aside>
    </div>
  );
}
