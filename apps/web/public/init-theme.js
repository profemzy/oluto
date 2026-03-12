// Theme initialization script - prevents flash of wrong theme
// Loaded with nonce for CSP compliance
try {
  var theme = localStorage.getItem('oluto-theme');
  var isDark = theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
} catch (e) {
  // localStorage not available or other error
}
