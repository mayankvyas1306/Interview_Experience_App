const cacheStore = new Map();

const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) {
    return null;
  }
  if (entry.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
};

const setCache = (key, value, ttlMs = 5 * 60 * 1000) => {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

const clearCacheByPrefix = (prefix) => {
  cacheStore.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  });
};

module.exports = { getCache, setCache, clearCacheByPrefix };
