/**
 * Recipe generation form with streaming output.
 * React island — hydrated client-side inside an Astro page.
 */

import { useState, useCallback, useRef } from "react";
import type { Recipe, GenerateRecipeRequest } from "../lib/types/recipe";

// ── Life stage options ──
const LIFE_STAGES = [
  { value: "puppy_early", label: "Puppy (< 4 mo)" },
  { value: "puppy_late", label: "Puppy (4+ mo)" },
  { value: "adult", label: "Adult" },
  { value: "senior", label: "Senior" },
];

const BREED_SIZES = [
  { value: "toy", label: "Toy/Small (< 10 kg)" },
  { value: "medium", label: "Medium (10–25 kg)" },
  { value: "large", label: "Large (25–45 kg)" },
  { value: "giant", label: "Giant (> 45 kg)" },
];

type GeneratorState = "idle" | "streaming" | "done" | "error";

export default function RecipeGenerator() {
  const [userRequest, setUserRequest] = useState("");
  const [lifeStage, setLifeStage] = useState("adult");
  const [breedSize, setBreedSize] = useState("medium");
  const [weightKg, setWeightKg] = useState(20);
  const [allergies, setAllergies] = useState("");

  const [state, setState] = useState<GeneratorState>("idle");
  const [streamedText, setStreamedText] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    setState("streaming");
    setStreamedText("");
    setRecipe(null);
    setError("");
    setSaved(false);

    const controller = new AbortController();
    abortRef.current = controller;

    const body: GenerateRecipeRequest = {
      user_request: userRequest,
      life_stage: lifeStage,
      breed_size_class: breedSize,
      weight_kg: weightKg,
      known_allergies: allergies || "none",
    };

    try {
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";
      let sseBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE events from OpenRouter (buffer across chunks)
        sseBuffer += chunk;
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              accumulated += delta;
              setStreamedText(accumulated);
            }
          } catch {
            // Ignore malformed/incomplete JSON lines
          }
        }
      }

      // Try to parse the accumulated JSON (strip markdown fences if present)
      let jsonStr = accumulated.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(jsonStr) as Recipe;
      setRecipe(parsed);
      setState("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setState("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "Generation failed");
      setState("error");
    }
  }, [userRequest, lifeStage, breedSize, weightKg, allergies]);

  const saveRecipe = useCallback(async () => {
    if (!recipe) return;
    setSaving(true);
    try {
      const res = await fetch("/api/recipes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe,
          user_prompt: userRequest,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      setSaved(true);

      // Fire async image generation (don't await)
      fetch("/api/recipes/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_id: recipe.id,
          name: recipe.name,
          protein: recipe.tags?.protein_type ?? "",
          carb: recipe.tags?.primary_carb ?? "",
          veggie: recipe.tags?.primary_veggie ?? "",
          cook_method: recipe.tags?.cook_method ?? "stovetop",
          ingredient_names: recipe.ingredients?.map((i) => i.name) ?? [],
        }),
      }).catch(() => {
        // Image generation is best-effort
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [recipe, userRequest]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <div className="recipe-gen">
      {/* ── Form ── */}
      <div className="recipe-gen__form">
        <div className="recipe-gen__field recipe-gen__field--full">
          <label htmlFor="user-request">Recipe request</label>
          <textarea
            id="user-request"
            rows={3}
            placeholder="e.g., A chicken and sweet potato recipe for a medium adult dog, stovetop-friendly, under 30 minutes"
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            disabled={state === "streaming"}
          />
        </div>

        <div className="recipe-gen__field">
          <label htmlFor="life-stage">Life stage</label>
          <select
            id="life-stage"
            value={lifeStage}
            onChange={(e) => setLifeStage(e.target.value)}
            disabled={state === "streaming"}
          >
            {LIFE_STAGES.map((ls) => (
              <option key={ls.value} value={ls.value}>
                {ls.label}
              </option>
            ))}
          </select>
        </div>

        <div className="recipe-gen__field">
          <label htmlFor="breed-size">Breed size</label>
          <select
            id="breed-size"
            value={breedSize}
            onChange={(e) => setBreedSize(e.target.value)}
            disabled={state === "streaming"}
          >
            {BREED_SIZES.map((bs) => (
              <option key={bs.value} value={bs.value}>
                {bs.label}
              </option>
            ))}
          </select>
        </div>

        <div className="recipe-gen__field">
          <label htmlFor="weight-kg">Weight (kg)</label>
          <input
            id="weight-kg"
            type="number"
            min={1}
            max={100}
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            disabled={state === "streaming"}
          />
        </div>

        <div className="recipe-gen__field">
          <label htmlFor="allergies">Known allergies</label>
          <input
            id="allergies"
            type="text"
            placeholder="none, or: beef, dairy, ..."
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            disabled={state === "streaming"}
          />
        </div>

        <div className="recipe-gen__actions">
          {state === "streaming" ? (
            <button type="button" className="button button--danger" onClick={stop}>
              Stop
            </button>
          ) : (
            <button
              type="button"
              className="button button--primary"
              onClick={generate}
              disabled={!userRequest.trim()}
            >
              Generate Recipe
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="recipe-gen__error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Streaming output ── */}
      {state === "streaming" && (
        <div className="recipe-gen__stream">
          <div className="recipe-gen__stream-header">
            <span className="recipe-gen__spinner" />
            <span>Generating recipe...</span>
          </div>
          <pre className="recipe-gen__raw">{streamedText}</pre>
        </div>
      )}

      {/* ── Parsed recipe preview ── */}
      {recipe && state === "done" && (
        <div className="recipe-gen__preview">
          <div className="recipe-gen__preview-header">
            <h2>{recipe.name}</h2>
            <div className="recipe-gen__preview-actions">
              {saved ? (
                <span className="recipe-gen__saved">
                  Saved <a href={`/admin/recipes/${recipe.id}`}>View →</a>
                </span>
              ) : (
                <button
                  type="button"
                  className="button button--primary"
                  onClick={saveRecipe}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save to DB"}
                </button>
              )}
            </div>
          </div>

          {recipe.description && (
            <p className="recipe-gen__description">{recipe.description}</p>
          )}

          <p className="recipe-gen__overview">{recipe.overview}</p>

          <div className="recipe-gen__tags">
            <span className="tag">{recipe.tags?.protein_type}</span>
            <span className="tag">{recipe.tags?.primary_carb?.replace(/_/g, " ")}</span>
            <span className="tag">{recipe.tags?.primary_veggie?.replace(/_/g, " ")}</span>
            <span className="badge">{recipe.tags?.tier}</span>
            <span className="badge">⏱ {recipe.tags?.prep_time_min} min</span>
            <span className="badge">{recipe.tags?.target_life_stage}</span>
          </div>

          <h3>Ingredients ({recipe.ingredients?.length})</h3>
          <div className="recipe-gen__ingredients">
            {recipe.ingredients?.map((ing, i) => (
              <div key={i} className="recipe-gen__ing">
                <span className="recipe-gen__ing-name">{ing.name}</span>
                <span className="recipe-gen__ing-amount">
                  {ing.base_g != null ? `${ing.base_g} ${ing.unit}` : ing.unit}
                </span>
                <span className="recipe-gen__ing-prep">{ing.prep}</span>
              </div>
            ))}
          </div>

          <h3>Instructions ({recipe.instructions?.length})</h3>
          <ol className="recipe-gen__instructions">
            {recipe.instructions?.map((inst, i) => (
              <li key={i} className="recipe-gen__step">
                <span className="recipe-gen__step-cat">{inst.category}</span>
                <span
                  className="recipe-gen__step-text"
                  dangerouslySetInnerHTML={{
                    __html: inst.instruction
                      .replaceAll("&", "&amp;")
                      .replaceAll("<", "&lt;")
                      .replaceAll(">", "&gt;")
                      .replaceAll('"', "&quot;")
                      .replaceAll("'", "&#39;")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                  }}
                />
                {inst.time_minutes && (
                  <span className="recipe-gen__step-time">{inst.time_minutes} min</span>
                )}
              </li>
            ))}
          </ol>

          {recipe.notes?.length > 0 && (
            <>
              <h3>Notes</h3>
              <ul>
                {recipe.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </>
          )}

          {recipe.disclaimers?.length > 0 && (
            <>
              <h3>Disclaimers</h3>
              <ul className="recipe-gen__disclaimers">
                {recipe.disclaimers.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </>
          )}

          {/* Raw JSON toggle */}
          <details className="recipe-gen__json-toggle">
            <summary>Raw JSON</summary>
            <pre className="recipe-gen__raw">
              {JSON.stringify(recipe, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
