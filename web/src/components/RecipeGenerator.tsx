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

const COOKING_DEVICES = [
  { value: "stovetop", label: "Pan" },
  { value: "slow_cooker", label: "Slow cooker" },
  { value: "instant_pot", label: "Pressure cooker" },
] as const;

type GeneratorState = "idle" | "streaming" | "saving" | "error";

export default function RecipeGenerator() {
  const [userRequest, setUserRequest] = useState("");
  const [lifeStage, setLifeStage] = useState("adult");
  const [breedSize, setBreedSize] = useState("medium");
  const [weightKg, setWeightKg] = useState(20);
  const [allergies, setAllergies] = useState("");
  const [cookMethod, setCookMethod] = useState<GenerateRecipeRequest["cook_method"]>("stovetop");

  const [state, setState] = useState<GeneratorState>("idle");
  const [streamedText, setStreamedText] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    setState("streaming");
    setStreamedText("");
    setRecipe(null);
    setError("");

    const controller = new AbortController();
    abortRef.current = controller;

    const body: GenerateRecipeRequest = {
      user_request: userRequest,
      life_stage: lifeStage,
      breed_size_class: breedSize,
      weight_kg: weightKg,
      known_allergies: allergies || "none",
      cook_method: cookMethod,
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
      setState("saving");

      // Auto-save to DB
      const saveRes = await fetch("/api/recipes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: parsed, user_prompt: userRequest }),
      });
      if (!saveRes.ok) {
        const errJson = await saveRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Save failed: HTTP ${saveRes.status}`);
      }

      // Fire async image generation (best-effort)
      fetch("/api/recipes/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_id: parsed.id,
          name: parsed.name,
          protein: parsed.tags?.protein_type ?? "",
          carb: parsed.tags?.primary_carb ?? "",
          veggie: parsed.tags?.primary_veggie ?? "",
          cook_method: parsed.tags?.cook_method ?? "stovetop",
          ingredient_names: parsed.ingredients?.map((i) => i.name) ?? [],
        }),
      }).catch(() => {});

      // Navigate to recipe detail
      window.location.href = `/recipes/${parsed.id}`;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setState("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "Generation failed");
      setState("error");
    }
  }, [userRequest, lifeStage, breedSize, weightKg, allergies, cookMethod]);

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
            disabled={state === "streaming" || state === "saving"}
          />
        </div>

        <div className="recipe-gen__field">
          <label htmlFor="life-stage">Life stage</label>
          <select
            id="life-stage"
            value={lifeStage}
            onChange={(e) => setLifeStage(e.target.value)}
            disabled={state === "streaming" || state === "saving"}
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
            disabled={state === "streaming" || state === "saving"}
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
            disabled={state === "streaming" || state === "saving"}
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
            disabled={state === "streaming" || state === "saving"}
          />
        </div>

        <div className="recipe-gen__field">
          <label htmlFor="cook-method">Cooking device</label>
          <select
            id="cook-method"
            value={cookMethod ?? "stovetop"}
            onChange={(e) => setCookMethod(e.target.value as GenerateRecipeRequest["cook_method"])}
            disabled={state === "streaming" || state === "saving"}
          >
            {COOKING_DEVICES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
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
      {(state === "streaming" || state === "saving") && (
        <div className="recipe-gen__stream">
          <div className="recipe-gen__stream-header">
            <span className="recipe-gen__spinner" />
            <span>{state === "saving" ? "Saving recipe..." : "Generating recipe..."}</span>
          </div>
          <pre className="recipe-gen__raw">{streamedText}</pre>
        </div>
      )}
    </div>
  );
}
