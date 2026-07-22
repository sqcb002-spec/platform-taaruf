import { describe, expect, it, vi } from "vitest";
import {
  isTransientDatabaseError,
  readTransientOrFallback,
  retryTransientRead,
} from "./retry";

describe("database read retry", () => {
  it("recognizes nested Neon network failures", () => {
    const error = new Error("Failed query");
    error.cause = new Error("fetch failed", { cause: { code: "ETIMEDOUT" } });
    expect(isTransientDatabaseError(error)).toBe(true);
  });

  it("retries a transient read and returns its eventual result", async () => {
    vi.useFakeTimers();
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockResolvedValue("ok");

    const result = retryTransientRead(operation);
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("does not retry validation or authorization failures", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("FORBIDDEN"));
    await expect(retryTransientRead(operation)).rejects.toThrow("FORBIDDEN");
    expect(operation).toHaveBeenCalledOnce();
  });

  it("returns a marked fallback after transient read attempts fail", async () => {
    vi.useFakeTimers();
    const operation = vi.fn().mockRejectedValue(new Error("fetch failed"));
    const result = readTransientOrFallback(operation, ["cached"], "test.read");
    await vi.runAllTimersAsync();

    await expect(result).resolves.toEqual({
      data: ["cached"],
      degraded: true,
    });
    vi.useRealTimers();
  });
});
