"use client";
import { useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LeadForm({ action, submitLabel = "Отправить заявку" }: { action: (input: unknown) => Promise<{ ok: boolean; error?: string }>; submitLabel?: string }) {
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-center">
        <p className="font-medium">Заявка принята.</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Мы свяжемся с вами в ближайшее рабочее время.</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("pending");
        setError(null);
        const form = new FormData(e.currentTarget);
        const result = await action({
          name: form.get("name"),
          phone: form.get("phone"),
          channelPref: form.get("channelPref"),
          message: form.get("message") || undefined,
        });
        if (result.ok) {
          setState("done");
        } else {
          setState("error");
          setError(result.error ?? "Не получилось отправить, попробуйте позвонить");
        }
      }}
    >
      <Input name="name" placeholder="Имя" required />
      <Input name="phone" placeholder="Телефон" required />
      <Select name="channelPref" defaultValue="call">
        <option value="call">Удобно: звонок</option>
        <option value="telegram">Удобно: Telegram</option>
        <option value="vk">Удобно: VK</option>
        <option value="whatsapp">Удобно: WhatsApp</option>
      </Select>
      <Textarea name="message" placeholder="Что нужно (инструмент, сроки)" rows={3} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" disabled={state === "pending"} className="w-full">
        {state === "pending" ? "Отправляем..." : submitLabel}
      </Button>
    </form>
  );
}
