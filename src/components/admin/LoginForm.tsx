"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginAction } from "@/app/admin/login/actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const result = await loginAction(new FormData(e.currentTarget));
        setPending(false);
        if (result?.error) setError(result.error);
      }}
    >
      <Input name="password" type="password" placeholder="Пароль администратора" required autoFocus />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Входим..." : "Войти"}
      </Button>
    </form>
  );
}
