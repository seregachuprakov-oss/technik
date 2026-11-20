import { EnrichmentForm } from "@/components/admin/EnrichmentForm";
import { EnrichmentReviewList } from "@/components/admin/EnrichmentReviewList";
import { listProductsForPicker } from "./actions";
import { listAllDrafts } from "@/server/enrichment/run";

export const dynamic = "force-dynamic";

export default async function AdminEnrichmentPage() {
  const [products, drafts] = await Promise.all([listProductsForPicker(), listAllDrafts(100)]);
  const pending = drafts.filter((d) => d.status === "pending_review");
  const decided = drafts.filter((d) => d.status !== "pending_review");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">AI-обогащение карточек (бета)</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        Черновик описания и иллюстративное фото генерируются AI ТОЛЬКО на основе данных, уже
        сохранённых в карточке товара (название, категория, характеристики, старое описание из 1С),
        и текста, который вы сами вставите ниже. AI никогда не ходит в интернет сам и не копирует
        фото с других сайтов — фото всегда оригинальное, иллюстративное, и будет помечено как
        «Фото иллюстративное», пока вы не загрузите настоящее. Ничего не публикуется на сайт
        автоматически — только после того, как вы нажмёте «Одобрить» ниже.
      </p>

      <div className="mt-6">
        <EnrichmentForm products={products} />
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold">На проверке ({pending.length})</h2>
      <div className="mt-4">
        <EnrichmentReviewList drafts={pending} />
      </div>

      {decided.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-lg font-semibold">История решений</h2>
          <div className="mt-4">
            <EnrichmentReviewList drafts={decided} />
          </div>
        </>
      )}
    </div>
  );
}
