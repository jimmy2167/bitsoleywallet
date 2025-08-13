const KEY = "bitsoley_wallet_v2";

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadState() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return v;
  } catch (_) {
    return {};
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}
