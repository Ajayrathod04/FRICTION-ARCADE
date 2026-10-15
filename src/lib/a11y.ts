/**
 * Live region announcer for screen readers
 */
let announcerEl: HTMLElement | null = null;

export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;

  if (!announcerEl) {
    announcerEl = document.getElementById('a11y-announcer');
    if (!announcerEl) {
      announcerEl = document.createElement('div');
      announcerEl.id = 'a11y-announcer';
      announcerEl.setAttribute('aria-live', politeness);
      announcerEl.setAttribute('aria-atomic', 'true');
      announcerEl.style.position = 'absolute';
      announcerEl.style.width = '1px';
      announcerEl.style.height = '1px';
      announcerEl.style.padding = '0';
      announcerEl.style.margin = '-1px';
      announcerEl.style.overflow = 'hidden';
      announcerEl.style.clip = 'rect(0, 0, 0, 0)';
      announcerEl.style.whiteSpace = 'nowrap';
      announcerEl.style.border = '0';
      document.body.appendChild(announcerEl);
    }
  }

  // Clear briefly then set so identical consecutive announcements fire
  announcerEl.textContent = '';
  setTimeout(() => {
    if (announcerEl) {
      announcerEl.textContent = message;
    }
  }, 50);
}

export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}
