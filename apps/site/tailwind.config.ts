import type { Config } from 'tailwindcss';
import { softlocTailwindPreset } from '@softloc/ui/tailwind';

const config: Config = {
  presets: [softlocTailwindPreset as Config],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
