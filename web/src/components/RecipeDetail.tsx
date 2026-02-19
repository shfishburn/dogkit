/**
 * Recipe detail view with async image loading.
 * Polls for the image if it hasn't been generated yet.
 */

import { useQuery } from "@tanstack/react-query";
import QueryProvider from "./QueryProvider";
import type { RecipeRow, RecipeInstruction, RecipeIngredient } from "../lib/types/recipe";
import { labelify } from "../lib/utils";

function renderMarkdown(text: string): string {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  // Controlled HTML output: only <strong>/<em>
  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

function RecipeDetailInner({ recipeId }: { recipeId: string }) {
  const { data: recipe, isLoading, error } = useQuery<RecipeRow>({
    queryKey: ["recipe", recipeId],
    queryFn: async () => {
      const res = await fetch(`/api/recipes?id=eq.${encodeURIComponent(recipeId)}&limit=1`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      if (!rows.length) throw new Error("Recipe not found");
      return rows[0];
    },
    refetchInterval: (query) => {
      // Poll every 10s until image appears, then stop
      const data = query.state.data;
      return data?.image_url ? false : 10_000;
    },
  });

  if (isLoading) {
    return <div className="rd__loading">Loading recipe...</div>;
  }

  if (error || !recipe) {
    return (
      <div className="rd__error">
        {error instanceof Error ? error.message : "Recipe not found"}
      </div>
    );
  }

  const imageUrl = recipe.image_url;
  const heroSrc = imageUrl
    ? `${imageUrl}?width=960&height=600&resize=cover&quality=75`
        .replace("/object/public/", "/render/image/public/")
    : null;

  const ingredients: RecipeIngredient[] =
    typeof recipe.ingredients === "string"
      ? JSON.parse(recipe.ingredients)
      : recipe.ingredients ?? [];

  const instructions: RecipeInstruction[] =
    typeof recipe.instructions === "string"
      ? JSON.parse(recipe.instructions)
      : recipe.instructions ?? [];

  const normalizedInstructions: RecipeInstruction[] = Array.isArray(instructions)
    ? (typeof instructions[0] === "string"
        ? (instructions as unknown as string[]).map((s, idx) => ({
            step: idx + 1,
            category: "cooking",
            instruction: s,
            time_minutes: null,
            equipment: null,
          }))
        : (instructions as RecipeInstruction[]))
    : [];

  const disclaimers: string[] =
    typeof recipe.disclaimers === "string"
      ? JSON.parse(recipe.disclaimers)
      : recipe.disclaimers ?? [];

  const notes: string[] =
    typeof recipe.notes === "string"
      ? JSON.parse(recipe.notes)
      : recipe.notes ?? [];

  return (
    <article className="rd">
      {/* Hero */}
      {heroSrc ? (
        <figure className="rd__hero">
          <img
            className="rd__hero-img"
            src={heroSrc}
            alt={recipe.name}
            width={960}
            height={600}
            loading="eager"
          />
        </figure>
      ) : (
        <div
          className="rd__hero rd__hero--skeleton"
          role="img"
          aria-label="Hero image generating"
        />
      )}

      {/* Header */}
      <header className="rd__header">
        <div className="rd__meta">
          <span className={`badge ${recipe.tier === "T2" ? "badge--t2" : "badge--t1"}`}>
            {recipe.tier}
          </span>
          <span className="badge badge--time">{recipe.prep_time_min} min</span>
          <span className="tag tag--protein">{labelify(recipe.protein_type)}</span>
          <span className="tag tag--carb">{labelify(recipe.primary_carb)}</span>
          <span className="tag tag--veggie">{labelify(recipe.primary_veggie)}</span>
          {recipe.target_life_stage && (
            <span className="badge">{labelify(recipe.target_life_stage)}</span>
          )}
        </div>
        <h1 className="rd__title">{recipe.name}</h1>
        {recipe.description && <p className="rd__description">{recipe.description}</p>}
        <p className="rd__overview">{recipe.overview}</p>
      </header>

      {/* Ingredients */}
      <section className="rd__section">
        <h2 className="rd__section-title">Ingredients</h2>
        <div className="rd__ing-card">
          {ingredients.map((ing, i) => (
            <div key={i} className="rd__ing">
              <div className="rd__ing-left">
                <span className="rd__ing-name">{ing.name}</span>
                {ing.prep && (
                  <span
                    className="rd__ing-prep"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(ing.prep) }}
                  />
                )}
              </div>
              {ing.base_g != null && (
                <span className="rd__ing-amount">
                  {ing.base_g} {ing.unit}
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="rd__note">All quantities per 1,000 kcal ME</p>
      </section>

      {/* Instructions */}
      <section className="rd__section">
        <h2 className="rd__section-title">Instructions</h2>
        <ol className="rd__steps">
          {normalizedInstructions.map((inst, i) => (
            <li key={i} className="rd__step">
              <span className="rd__step-num">
                {String(typeof inst.step === "number" ? inst.step : i + 1).padStart(2, "0")}
              </span>
              <div className="rd__step-body">
                <span className="rd__step-cat">{inst.category}</span>
                <span
                  className="rd__step-text"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(inst.instruction) }}
                />
                {inst.time_minutes && (
                  <span className="rd__step-time">⏱ {inst.time_minutes} min</span>
                )}
                {inst.equipment && (
                  <span className="rd__step-equip">🔧 {inst.equipment}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Notes */}
      {notes.length > 0 && (
        <section className="rd__section">
          <h2 className="rd__section-title">Notes</h2>
          <ul className="rd__disclaimers">
            {notes.map((n, idx) => (
              <li key={idx}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Disclaimers */}
      {disclaimers.length > 0 && (
        <section className="rd__section">
          <h2 className="rd__section-title">Disclaimers</h2>
          <ul className="rd__disclaimers">
            {disclaimers.map((d, idx) => (
              <li key={idx}>{d}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Metadata */}
      <section className="rd__section">
        <h2 className="rd__section-title">Generation info</h2>
        <dl className="rd__meta-list">
          {recipe.generated_by && (
            <>
              <dt>Model</dt>
              <dd>{recipe.generated_by}</dd>
            </>
          )}
          {recipe.user_prompt && (
            <>
              <dt>Prompt</dt>
              <dd>{recipe.user_prompt}</dd>
            </>
          )}
          <dt>Created</dt>
          <dd>{new Date(recipe.created_at).toLocaleDateString()}</dd>
        </dl>
      </section>

      {/* Copy JSON */}
      <details className="rd__json-toggle">
        <summary>Recipe JSON</summary>
        <pre className="rd__raw">{JSON.stringify(recipe, null, 2)}</pre>
      </details>
    </article>
  );
}

export default function RecipeDetail({ recipeId }: { recipeId: string }) {
  return (
    <QueryProvider>
      <RecipeDetailInner recipeId={recipeId} />
    </QueryProvider>
  );
}
