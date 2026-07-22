const transientMarkers = [
  "etimedout",
  "fetch failed",
  "failed to get session",
  "failed query",
  "connection reset",
  "econnreset",
  "econnrefused",
];

function errorChain(error: unknown) {
  const messages: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < 6 && current; depth += 1) {
    if (current instanceof Error) messages.push(current.message, current.name);
    else if (typeof current === "string") messages.push(current);
    if (typeof current === "object" && "code" in current) {
      messages.push(String((current as { code?: unknown }).code ?? ""));
    }
    current =
      typeof current === "object" && "cause" in current
        ? (current as { cause?: unknown }).cause
        : null;
  }
  return messages.join(" ").toLowerCase();
}

export function isTransientDatabaseError(error: unknown) {
  const message = errorChain(error);
  return transientMarkers.some((marker) => message.includes(marker));
}

export async function retryTransientRead<T>(
  operation: () => Promise<T>,
  attempts = 3,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientDatabaseError(error) || attempt === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));
    }
  }
  throw lastError;
}

export async function readTransientOrFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string,
) {
  try {
    return { data: await retryTransientRead(operation), degraded: false };
  } catch (error) {
    if (!isTransientDatabaseError(error)) throw error;
    console.warn("database.read.degraded", { context });
    return { data: fallback, degraded: true };
  }
}
