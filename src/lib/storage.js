
const KEY = "bitsoley_wallet_pro_v1";
export const saveState = (s) => localStorage.setItem(KEY, JSON.stringify(s));
export const loadState = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
export const clearState = () => localStorage.removeItem(KEY);
