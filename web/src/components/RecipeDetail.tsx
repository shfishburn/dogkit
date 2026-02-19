/**
 * Recipe detail view with async image loading.
 * Polls for the image if it hasn't been generated yet.
 */

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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

function currentUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function roundUp(value: number, increment: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(increment) || increment <= 0) return value;
  return Math.ceil(value / increment) * increment;
}

function roundUpQuarter(value: number): number {
  if (!Number.isFinite(value)) return value;
  return Math.ceil(value * 4) / 4;
}

function formatDisplayQuantity(
  ing: Pick<RecipeIngredient, "base_g" | "unit" | "display_quantity">,
  multiplier: number,
): string {
  if (ing.unit === "IU") {
    if (typeof ing.base_g === "number" && Number.isFinite(ing.base_g)) {
      const scaled = Math.ceil(ing.base_g * multiplier);
      return `${scaled} IU`;
    }
    return ing.display_quantity ?? "";
  }

  if (typeof ing.base_g !== "number" || !Number.isFinite(ing.base_g)) {
    return ing.display_quantity ?? "";
  }

  if (ing.unit === "g") {
    const g = roundUp(ing.base_g * multiplier, 5);
    const oz = roundUpQuarter(g / 28.349523125);
    const ozStr = Number.isFinite(oz) ? oz.toFixed(oz % 1 === 0 ? 0 : 2).replace(/0+$/, "").replace(/\.$/, "") : "";
    return `${ozStr} oz (${g} g)`;
  }

  if (ing.unit === "ml") {
    const ml = roundUp(ing.base_g * multiplier, 1);
    const floz = roundUpQuarter(ml / 29.5735295625);
    const flozStr = Number.isFinite(floz) ? floz.toFixed(floz % 1 === 0 ? 0 : 2).replace(/0+$/, "").replace(/\.$/, "") : "";
    return `${flozStr} fl oz (${ml} ml)`;
  }

  return ing.display_quantity ?? "";
}

function RecipePrintShare({ title }: { title: string }) {
  async function onShare() {
    const url = currentUrl();
    if (!url) return;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      // Fall through to copy link.
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
        return;
      }
    } catch {
      // Fall through.
    }

    // Last-resort fallback.
    prompt("Copy link:", url);
  }

  return (
    <div className="rd__actions no-print">
      <button type="button" className="button" onClick={() => window.print()}>
        Print
      </button>
      <button type="button" className="button" onClick={onShare}>
        Share
      </button>
    </div>
  );
}

function RecipeDetailInner({ recipeId }: { recipeId: string }) {
  const doneKey = useMemo(() => `dogology:recipe:${recipeId}:doneIngredients`, [recipeId]);
  const doneStepsKey = useMemo(() => `dogology:recipe:${recipeId}:doneSteps`, [recipeId]);
  const [doneIngredientIds, setDoneIngredientIds] = useState<string[]>([]);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [scale, setScale] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(doneKey);
      if (!raw) {
        setDoneIngredientIds([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setDoneIngredientIds(Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : []);
    } catch {
      setDoneIngredientIds([]);
    }
  }, [doneKey]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(doneStepsKey);
      if (!raw) {
        setDoneSteps([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setDoneSteps(
        Array.isArray(parsed)
          ? parsed.filter((x) => typeof x === "number" && Number.isFinite(x))
          : [],
      );
    } catch {
      setDoneSteps([]);
    }
  }, [doneStepsKey]);

  useEffect(() => {
    try {
      localStorage.setItem(doneKey, JSON.stringify(doneIngredientIds));
    } catch {
      // ignore
    }
  }, [doneKey, doneIngredientIds]);

  useEffect(() => {
    try {
      localStorage.setItem(doneStepsKey, JSON.stringify(doneSteps));
    } catch {
      // ignore
    }
  }, [doneStepsKey, doneSteps]);

  const doneSet = useMemo(() => new Set(doneIngredientIds), [doneIngredientIds]);
  const doneStepsSet = useMemo(() => new Set(doneSteps), [doneSteps]);

  function toggleIngredientDone(ingredientId: string) {
    setDoneIngredientIds((prev) => {
      if (prev.includes(ingredientId)) return prev.filter((id) => id !== ingredientId);
      return [...prev, ingredientId];
    });
  }

  function toggleStepDone(stepNum: number) {
    setDoneSteps((prev) => {
      if (prev.includes(stepNum)) return prev.filter((n) => n !== stepNum);
      return [...prev, stepNum];
    });
  }

  async function copyIngredients() {
    const lines = ingredients
      .map((ing) => {
        const qty = formatDisplayQuantity(ing, scale);
        const prep = ing.prep ? ` — ${ing.prep}` : "";
        return `${ing.name}${qty ? `: ${qty}` : ""}${prep}`;
      })
      .join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      alert("Ingredients copied");
    } catch {
      prompt("Copy ingredients:", lines);
    }
  }

  async function copyInstructions() {
    const lines = normalizedInstructions
      .map((inst) => {
        const num = typeof inst.step === "number" ? inst.step : 0;
        const cat = inst.category ? ` [${inst.category}]` : "";
        const time = inst.time_minutes ? ` (${inst.time_minutes} min)` : "";
        return `${num}. ${inst.instruction}${cat}${time}`;
      })
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(lines);
      alert("Instructions copied");
    } catch {
      prompt("Copy instructions:", lines);
    }
  }

  function resetChecklists() {
    setDoneIngredientIds([]);
    setDoneSteps([]);
    try {
      localStorage.removeItem(doneKey);
      localStorage.removeItem(doneStepsKey);
    } catch {
      // ignore
    }
  }

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
      <div className="rd__sticky no-print">
        <div className="rd__sticky-inner">
          <div className="rd__sticky-title">{recipe.name}</div>
          <nav className="rd__sticky-nav" aria-label="Recipe sections">
            <a href="#ingredients">Ingredients</a>
            <a href="#instructions">Instructions</a>
            {notes.length > 0 && <a href="#notes">Notes</a>}
            {disclaimers.length > 0 && <a href="#disclaimers">Disclaimers</a>}
          </nav>
          <div className="rd__sticky-actions">
            <label className="rd__scale">
              <span className="rd__scale-label">Scale</span>
              <select
                className="rd__scale-select"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value) as 1 | 2 | 3)}
              >
                <option value={1}>1×</option>
                <option value={2}>2×</option>
                <option value={3}>3×</option>
              </select>
            </label>
            <button type="button" className="button button--sm" onClick={resetChecklists}>
              Reset
            </button>
            <RecipePrintShare title={recipe.name} />
          </div>
        </div>
      </div>

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
        {recipe.description && (
          <p
            className="rd__description"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(recipe.description) }}
          />
        )}
        <p
          className="rd__overview"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(recipe.overview) }}
        />
      </header>

      {/* Ingredients */}
      <section className="rd__section" id="ingredients">
        <div className="rd__section-head">
          <h2 className="rd__section-title">Ingredients</h2>
          <div className="rd__section-actions no-print">
            <button type="button" className="button button--sm" onClick={copyIngredients}>
              Copy
            </button>
          </div>
        </div>
        <div className="rd__ing-card">
          {ingredients.map((ing, i) => (
            <div
              key={ing.ingredient_id || i}
              className={`rd__ing ${doneSet.has(ing.ingredient_id) ? "rd__ing--done" : ""}`}
            >
              <div className="rd__ing-main">
                <input
                  className="rd__ing-check"
                  type="checkbox"
                  checked={doneSet.has(ing.ingredient_id)}
                  onChange={() => toggleIngredientDone(ing.ingredient_id)}
                  aria-label={`Mark ${ing.name} as done`}
                />
                <div className="rd__ing-left">
                  <span className="rd__ing-name">{ing.name}</span>
                  {ing.prep && (
                    <span
                      className="rd__ing-prep"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(ing.prep) }}
                    />
                  )}
                </div>
              </div>
              <div className="rd__ing-amount">
                <span className="rd__ing-amount-main">
                  {formatDisplayQuantity(ing, scale)}
                </span>
                {scale !== 1 && (
                  <span className="rd__ing-amount-sub">Base: {formatDisplayQuantity(ing, 1)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="rd__note">All quantities per 1,000 kcal ME</p>
      </section>

      {/* Instructions */}
      <section className="rd__section" id="instructions">
        <div className="rd__section-head">
          <h2 className="rd__section-title">Instructions</h2>
          <div className="rd__section-actions no-print">
            <button type="button" className="button button--sm" onClick={copyInstructions}>
              Copy
            </button>
          </div>
        </div>
        <ol className="rd__steps">
          {normalizedInstructions.map((inst, i) => (
            <li
              key={i}
              className={`rd__step ${doneStepsSet.has(inst.step) ? "rd__step--done" : ""}`}
            >
              <label className="rd__step-checkwrap">
                <input
                  className="rd__step-check"
                  type="checkbox"
                  checked={doneStepsSet.has(inst.step)}
                  onChange={() => toggleStepDone(inst.step)}
                  aria-label={`Mark step ${inst.step} as done`}
                />
                <span className="rd__step-num">
                  {String(typeof inst.step === "number" ? inst.step : i + 1).padStart(2, "0")}
                </span>
              </label>
              <div className="rd__step-body">
                <div className="rd__step-badges">
                  <span className="rd__step-cat">{inst.category}</span>
                  {inst.time_minutes && (
                    <span className="rd__step-time">⏱ {inst.time_minutes} min</span>
                  )}
                  {inst.equipment && (
                    <span className="rd__step-equip">🔧 {inst.equipment}</span>
                  )}
                </div>
                <span
                  className="rd__step-text"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(inst.instruction) }}
                />
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Notes */}
      {notes.length > 0 && (
        <section className="rd__section" id="notes">
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
        <section className="rd__section" id="disclaimers">
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
