const THEME_STORAGE_KEY = 'theme';

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    // localStorage unavailable (private browsing, disabled storage, etc.)
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable - theme just won't persist across visits.
  }
}

function getCurrentTheme(root = document.documentElement) {
  return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function applyTheme(theme, root = document.documentElement) {
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
}

function initTheme(root = document.documentElement) {
  if (getStoredTheme() === 'light') {
    applyTheme('light', root);
  }
}

function toggleTheme(root = document.documentElement) {
  const next = getCurrentTheme(root) === 'light' ? 'dark' : 'light';
  applyTheme(next, root);
  setStoredTheme(next);
  return next;
}

export {
  THEME_STORAGE_KEY,
  getStoredTheme,
  setStoredTheme,
  getCurrentTheme,
  applyTheme,
  initTheme,
  toggleTheme,
};
