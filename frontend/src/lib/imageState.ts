/**
 * NutriVerify Unified Active Image Architecture
 * Single source of truth for user-captured and uploaded label imagery.
 * When a user uploads or captures a real label, it overrides sample visuals everywhere.
 */

const STORAGE_KEY = 'nv_uploaded_image';
const RESULT_KEY = 'nv_last_result';

export function getActiveImage(): string | null {
  try {
    const direct = sessionStorage.getItem(STORAGE_KEY);
    if (direct) return direct;

    const lastResultRaw = sessionStorage.getItem(RESULT_KEY);
    if (lastResultRaw) {
      const parsed = JSON.parse(lastResultRaw);
      if (parsed?.imageUrl) return parsed.imageUrl;
    }
  } catch {}
  return null;
}

export function setActiveImage(imageDataUrl: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, imageDataUrl);
    
    // Also propagate into active result if one exists
    const lastResultRaw = sessionStorage.getItem(RESULT_KEY);
    if (lastResultRaw) {
      const parsed = JSON.parse(lastResultRaw);
      parsed.imageUrl = imageDataUrl;
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(parsed));
    }
    
    // Dispatch custom event for reactive UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nv_image_updated', { detail: { imageUrl: imageDataUrl } }));
    }
  } catch (err) {
    console.error('Failed to store active image:', err);
  }
}

export function clearActiveImage(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nv_image_updated', { detail: { imageUrl: null } }));
    }
  } catch (err) {
    console.error('Failed to clear active image:', err);
  }
}
