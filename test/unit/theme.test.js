import { beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, getCurrentTheme, initTheme, toggleTheme } from '../../src/scripts/theme.js';

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
});

describe('getCurrentTheme', () => {
  it('defaults to dark when no data-theme is set', () => {
    expect(getCurrentTheme()).toBe('dark');
  });

  it('reports light when data-theme="light" is set', () => {
    document.documentElement.setAttribute('data-theme', 'light');

    expect(getCurrentTheme()).toBe('light');
  });
});

describe('applyTheme', () => {
  it('sets data-theme="light" for the light theme', () => {
    applyTheme('light');

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('removes data-theme for the dark theme', () => {
    document.documentElement.setAttribute('data-theme', 'light');

    applyTheme('dark');

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});

describe('toggleTheme', () => {
  it('switches from dark to light and persists the choice', () => {
    const next = toggleTheme();

    expect(next).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('switches from light back to dark and persists the choice', () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const next = toggleTheme();

    expect(next).toBe('dark');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});

describe('initTheme', () => {
  it('applies the light theme when it was previously stored', () => {
    localStorage.setItem('theme', 'light');

    initTheme();

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('leaves the default dark theme when nothing was stored', () => {
    initTheme();

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
