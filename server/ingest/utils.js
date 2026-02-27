function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retry = 3, delayMs = 800) {
  let lastError;
  for (let attempt = 0; attempt <= retry; attempt += 1) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastError = err;
      const backoff = delayMs * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * 200);
      await sleep(backoff + jitter);
    }
  }
  throw lastError;
}

function getByPath(obj, path) {
  if (!path) return obj;
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function resolveTemplateString(value) {
  if (typeof value !== "string") return value;
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => process.env[key] || "");
}

function resolveTemplates(input) {
  if (Array.isArray(input)) {
    return input.map((item) => resolveTemplates(item));
  }
  if (input && typeof input === "object") {
    const out = {};
    Object.entries(input).forEach(([key, value]) => {
      out[key] = resolveTemplates(value);
    });
    return out;
  }
  return resolveTemplateString(input);
}

export { sleep, fetchWithRetry, getByPath, normalizeArray, resolveTemplates };
