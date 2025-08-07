import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class", '[data-theme="dark"]'],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				// border: '#ff0000',        // Bright red
				// 'border-color': '#ff0000' // Bright red
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontSize: {
				'xs': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px (was 12px)
				'sm': ['1rem', { lineHeight: '1.5rem' }],         // 16px (was 14px)
				'base': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px (was 16px)
				'lg': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px (was 18px)
				'xl': ['1.375rem', { lineHeight: '2rem' }],       // 22px (was 20px)
				'2xl': ['1.625rem', { lineHeight: '2.25rem' }],   // 26px (was 24px)
				'3xl': ['2rem', { lineHeight: '2.5rem' }],        // 32px (was 30px)
				'4xl': ['2.5rem', { lineHeight: '3rem' }],        // 40px (was 36px)
				'5xl': ['3.125rem', { lineHeight: '3.5rem' }],    // 50px (was 48px)
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;
