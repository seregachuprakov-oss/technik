import { Logo } from "@/components/site/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-ink)] px-4 text-[var(--color-text)]">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
        <Logo className="mx-auto mb-6" />
        <h1 className="mb-6 text-center font-display text-lg font-semibold">Админка «Техник»</h1>
        <LoginForm />
      </div>
    </div>
  );
}
