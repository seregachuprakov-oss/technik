"use client";
import { useState } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { Input, Textarea, Select, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LeadForm({
  action,
  submitLabel = "Отправить заявку",
}: {
  action: (input: unknown) => Promise<{ ok: boolean; error?: string }>;
  submitLabel?: string;
}) {
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "done") {
    return (
      <div className="rounded-md border border-ok/25 bg-ok-soft p-5 text-center">
        <div className="mx-auto grid size-10 place-items-center rounded-full bg-ok text-white">
          <Check size={19} strokeWidth={2.6} />
        </div>
        <p className="mt-3 font-display text-[15px] font-semibold text-text">Заявка у менеджера</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Перезвоним в рабочее время и скажем, свободен ли инструмент.
        </p>
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
          setError(result.error ?? "Не получилось отправить — позвоните нам");
        }
      }}
    >
      <Field label="Имя" htmlFor="lead-name">
        <Input id="lead-name" name="name" placeholder="Как к вам обращаться" required autoComplete="name" />
      </Field>

      <Field label="Телефон" htmlFor="lead-phone">
        <Input id="lead-phone" name="phone" type="tel" placeholder="+7 ..." required autoComplete="tel" inputMode="tel" />
      </Field>

      <Field label="Как удобнее ответить" htmlFor="lead-channel">
        <Select id="lead-channel" name="channelPref" defaultValue="call">
          <option value="call">Звонок</option>
          <option value="telegram">Telegram</option>
          <option value="vk">VK</option>
          <option value="whatsapp">WhatsApp</option>
        </Select>
      </Field>

      <Field label="Что нужно" htmlFor="lead-message" hint="Инструмент и срок: «перфоратор на субботу-воскресенье»">
        <Textarea id="lead-message" name="message" rows={3} placeholder="Опишите задачу" />
      </Field>

      {error && (
        <p className="flex items-start gap-2 rounded-md bg-bad-soft px-3 py-2.5 text-[13px] text-bad">
          <AlertCircle size={15} className="mt-px shrink-0" /> {error}
        </p>
      )}

      <Button type="submit" disabled={state === "pending"} className="w-full">
        {state === "pending" ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Отправляем
          </>
        ) : (
          submitLabel
        )}
      </Button>

      <p className="text-[11.5px] leading-relaxed text-faint">
        Отправляя форму, вы соглашаетесь на обработку указанных данных для ответа на заявку.
      </p>
    </form>
  );
}
