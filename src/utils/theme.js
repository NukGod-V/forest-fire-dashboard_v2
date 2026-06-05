/**
 * theme.js
 * Single source of truth for all design tokens per theme.
 * These values are injected as CSS custom properties on <html>
 * so every component can use var(--token) without prop drilling.
 */

export const THEMES = {
  dark: {
    // Surfaces
    '--bg-page':           '#020408',
    '--panel-bg':          'rgba(8, 10, 18, 0.72)',
    '--panel-bg-light':    'rgba(14, 18, 32, 0.55)',
    '--surface':           'rgba(255, 255, 255, 0.03)',
    '--surface-hover':     'rgba(255, 255, 255, 0.06)',

    // Borders
    '--border':            'rgba(255, 255, 255, 0.07)',
    '--border-hover':      'rgba(255, 255, 255, 0.14)',

    // Text
    '--text-primary':      '#F1F5F9',
    '--text-secondary':    '#94A3B8',
    '--text-muted':        '#475569',

    // Shadows & blur
    '--panel-shadow':      '0 8px 48px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.05) inset',
    '--blur':              'blur(20px) saturate(140%)',

    // Status bar
    '--statusbar-bg':      'rgba(4, 6, 12, 0.85)',

    // Accents (same in both themes)
    '--high':              '#FF003C',
    '--high-glow':         'rgba(255, 0, 60, 0.35)',
    '--mod':               '#FF8A00',
    '--mod-glow':          'rgba(255, 138, 0, 0.3)',
    '--low':               '#FFD600',
    '--low-glow':          'rgba(255, 214, 0, 0.25)',
    '--accent-blue':       '#3B82F6',
    '--accent-cyan':       '#06B6D4',

    // Chart colors (hardcoded for Chart.js which can't read CSS vars)
    '--chart-grid':        'rgba(255,255,255,0.04)',
    '--chart-tick':        '#64748B',
  },

  satellite: {
    // Surfaces — Tactical dark glass over satellite imagery
    '--bg-page':           'transparent',
    '--panel-bg':          'rgba(15, 23, 42, 0.75)', // Dark slate glass
    '--panel-bg-light':    'rgba(30, 41, 59, 0.65)',
    '--surface':           'rgba(255, 255, 255, 0.05)',
    '--surface-hover':     'rgba(255, 255, 255, 0.1)',

    // Borders
    '--border':            'rgba(255, 255, 255, 0.15)',
    '--border-hover':      'rgba(255, 255, 255, 0.25)',

    // Text (Reverted to Light Text for contrast)
    '--text-primary':      '#F8FAFC',
    '--text-secondary':    '#CBD5E1',
    '--text-muted':        '#64748B',

    // Shadows & blur
    '--panel-shadow':      '0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.1) inset',
    '--blur':              'blur(16px) saturate(120%)',

    // Status bar
    '--statusbar-bg':      'rgba(15, 23, 42, 0.85)',

    // Accents
    '--high':              '#FF003C',
    '--high-glow':         'rgba(255, 0, 60, 0.35)',
    '--mod':               '#FF8A00',
    '--mod-glow':          'rgba(255, 138, 0, 0.3)',
    '--low':               '#FFD600',
    '--low-glow':          'rgba(255, 214, 0, 0.25)',
    '--accent-blue':       '#3B82F6',
    '--accent-cyan':       '#06B6D4',

    '--chart-grid':        'rgba(255,255,255,0.06)',
    '--chart-tick':        '#94A3B8',
  },
};

/**
 * Injects theme tokens as CSS custom properties on <html>.
 * Call this whenever the theme changes.
 */
export function applyTheme(themeName) {
  const tokens = THEMES[themeName] ?? THEMES.dark;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
  root.setAttribute('data-theme', themeName);
}