import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default [
  ...nextVitals,
  ...nextTypeScript,
  {
    // Existing route/data loaders intentionally reset transient UI state in effects.
    "rules": { "react-hooks/set-state-in-effect": "off" },
  },
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/next-env.d.ts",
    ],
  },
];
