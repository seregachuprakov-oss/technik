import { Logo } from "@/components/site/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Вход", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="on-dark relative flex min-h-screen items-center justify-center px-5">
      <div className="blueprint absolute inset-0" aria-hidden />
      <div className="relative w-full max-w-sm rounded-xl border border-line bg-card p-7 shadow-s3">
        <Logo className="h-7" />
        <h1 className="mt-6 font-display text-[18px] font-semibold">Панель магазина</h1>
        <p className="mt-1.5 text-[13px] text-muted">
          Доступ по общему паролю. Если забыли — он лежит в .env.local на сервере.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
