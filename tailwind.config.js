/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'tablet': '768px',
      'laptop': '1024px',
      'desktop': '1280px',
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          400: "hsl(var(--primary-400))",
          600: "hsl(var(--primary-600))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          hover: "hsl(var(--destructive)) / 0.9",
          active: "hsl(var(--destructive)) / 0.8",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          hover: "hsl(var(--success)) / 0.9",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          hover: "hsl(var(--warning)) / 0.9",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          hover: "hsl(var(--info)) / 0.9",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        'mfb': {
          'green': 'var(--mfb-green)',
          'green-hover': 'var(--mfb-green-hover)',
          'green-light': 'var(--mfb-green-light)',
          'green-focus': 'var(--mfb-green-focus)',
          'clay': 'var(--mfb-clay)',
          'clay-hover': 'var(--mfb-clay-hover)',
          'cream': 'var(--mfb-cream)',
          'sage': 'var(--mfb-sage)',
          'sage-tint': 'var(--mfb-sage-tint)',
          'olive': 'var(--mfb-olive)',
          'olive-light': 'var(--mfb-olive-light)',
          'olive-lighter': 'var(--mfb-olive-lighter)',
          'white': 'var(--mfb-white)',
          'success': 'var(--mfb-success)',
          'warning': 'var(--mfb-warning)',
          'danger': 'var(--mfb-danger)',
          'info': 'var(--mfb-info)',
        },
        'priority': {
          'critical': {
            'bg': 'var(--priority-critical-bg)',
            'text': 'var(--priority-critical-text)',
          },
          'high': {
            'bg': 'var(--priority-high-bg)',
            'text': 'var(--priority-high-text)',
          },
          'medium': {
            'bg': 'var(--priority-medium-bg)',
            'text': 'var(--priority-medium-text)',
          },
          'low': {
            'bg': 'var(--priority-low-bg)',
            'text': 'var(--priority-low-text)',
          },
          'minimal': {
            'bg': 'var(--priority-minimal-bg)',
            'text': 'var(--priority-minimal-text)',
          },
        },
      },
      fontFamily: {
        'nunito': ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}