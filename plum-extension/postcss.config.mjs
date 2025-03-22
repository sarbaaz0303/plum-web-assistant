export default {
 plugins: {
  "postcss-import": {},
  "@tailwindcss/postcss": {},
  autoprefixer: {},
  "postcss-preset-env": { stage: 1 },
  cssnano: { preset: "default" },
 },
};
