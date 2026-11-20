"use client";
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input, Field } from "@/components/ui/Input";
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
        setError(null);
        const result = await loginAction(new FormData(e.currentTarget));
        setPending(false);
        if (result?.error) setError(result.error);
      }}
    >
      <Field label="Пароль" htmlFor="admin-password">
        <Input
          id="admin-password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoFocus
          autoComplete="current-password"
        />
      </Field>

      {error && (
        <p className="flex items-start gap-2 rounded-md bg-bad-soft px-3 py-2.5 text-[13px] text-bad">
          <AlertCircle size={15} className="mt-px shrink-0" /> {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Входим
          </>
        ) : (
          "Войти"
        )}
      </Button>
    </form>
  );
}
