/**
 * Recipe list with TanStack Query data fetching.
 * Polls for image updates so async-generated images appear without refresh.
 */

import { useQuery } from "@tanstack/react-query";
import QueryProvider from "./QueryProvider";
import type { RecipeRow } from "../lib/types/recipe";
import { labelify } from "../lib/utils";

function RecipeListInner({ detailHrefBase }: { detailHrefBase: string }) {
  const { data: recipes, isLoading, error } = useQuery<RecipeRow[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      const res = await fetch("/api/recipes");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 15_000, // Poll for image updates
  });

  if (isLoading) {
    return <div className="recipe-list__loading">Loading recipes...</div>;
  }

  if (error) {
    return (
      <div className="recipe-list__error">
        Failed to load recipes: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  if (!recipes?.length) {
    return (
      <div className="recipe-list__empty">
        <p>No recipes yet.</p>
        <a href="/admin/recipes/new" className="button button--primary">
          Generate your first recipe →
        </a>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((r) => {
        const imageUrl = r.image_url;
        // Use Supabase image transform for thumbnails
        const thumbSrc = imageUrl
          ? `${imageUrl}?width=480&height=480&resize=cover&quality=70`
              .replace("/object/public/", "/render/image/public/")
          : null;

        return (
          <a
            key={r.id}
            href={`${detailHrefBase}/${r.id}`}
            className="recipe-list-card"
          >
            {thumbSrc ? (
              <div className="recipe-list-card__media">
                <img
                  className="recipe-list-card__img"
                  src={thumbSrc}
                  alt={r.name}
                  width={360}
                  height={360}
                  loading="lazy"
                />
              </div>
            ) : (
              <div
                className="recipe-list-card__media recipe-list-card__media--skeleton"
                role="img"
                aria-label="Image generating"
              />
            )}
            <div className="recipe-list-card__badges">
              <span className={`badge ${r.tier === "T2" ? "badge--t2" : "badge--t1"}`}>
                {r.tier}
              </span>
              <span className="badge badge--time">⏱ {r.prep_time_min} min</span>
            </div>
            <h2 className="recipe-list-card__name">{r.name}</h2>
            <p className="recipe-list-card__tags">
              <span className="tag tag--protein">{labelify(r.protein_type)}</span>
              <span className="tag tag--carb">{labelify(r.primary_carb)}</span>
              <span className="tag tag--veggie">{labelify(r.primary_veggie)}</span>
            </p>
            <p className="recipe-list-card__overview">
              {r.description || r.overview?.slice(0, 150)}
            </p>
            <span className="recipe-list-card__cta" aria-hidden="true">
              View recipe →
            </span>
          </a>
        );
      })}
    </div>
  );
}

export default function RecipeList() {
  return (
    <QueryProvider>
      <RecipeListInner detailHrefBase="/admin/recipes" />
    </QueryProvider>
  );
}

export function RecipeListWithBase({ detailHrefBase }: { detailHrefBase: string }) {
  return (
    <QueryProvider>
      <RecipeListInner detailHrefBase={detailHrefBase} />
    </QueryProvider>
  );
}
