import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

// Flat config (ESLint 9) — faithful port of the previous
// `{ extends: "next/core-web-vitals", rules: { "@next/next/no-img-element": "off" } }`.
const eslintConfig = [
  { ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals'),
  {
    // Match the previous `next lint` behaviour: don't flag the intentional
    // `eslint-disable @next/next/no-img-element` comments (the rule is off).
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
]

export default eslintConfig
