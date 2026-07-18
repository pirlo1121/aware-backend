// Caché en memoria simple con TTL, pensado para respuestas de solo lectura
// que se repiten mucho entre requests (ej. primera página de posts publicados).
const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function clear() {
  store.clear();
}

module.exports = { get, set, clear };
