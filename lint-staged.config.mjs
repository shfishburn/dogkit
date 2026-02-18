export default {
  // Run ESLint from inside the web/ project so it can find web/eslint.config.mjs
  // and resolve Astro/TS plugins consistently.
  "web/src/**/*.{ts,astro,mjs}": (files) => {
    const webFiles = files.map((f) => f.replace(/^web\//, ""));
    const quoted = webFiles.map((f) => JSON.stringify(f)).join(" ");
    return `cd web && npx eslint --no-error-on-unmatched-pattern ${quoted}`;
  },
};
