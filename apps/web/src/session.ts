const KEY = 'copperline.userId';
export const USER_EVENT = 'copperline:user';

export function getCurrentUserId(): number {
  const stored = Number(localStorage.getItem(KEY));
  return Number.isSafeInteger(stored) && stored > 0 ? stored : 1;
}

export function setCurrentUserId(id: number): void {
  localStorage.setItem(KEY, String(id));
  window.dispatchEvent(new Event(USER_EVENT));
}
