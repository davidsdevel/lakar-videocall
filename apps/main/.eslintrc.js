module.exports = {
  extends: ["next"],
/*  settings: {
    react: {
      version: "detect",
    },
  },*/
  rules: {
    "semi": ["warn", "always"],
    "quotes": ["warn", "single"],
    "array-bracket-spacing": "error",
    "arrow-spacing": "error",
    "complexity": "off",
    "curly": "off",
    "@next/next/no-img-element": "off",
    "no-buffer-constructor": "error",
    "no-var": "error",
    "no-console": "warn",
    'no-unused-vars': 'error',
    'no-unused-expressions': 'error'
  }
};
