/** Retry reads during brief API restarts. Mutations must handle their own acknowledgement. */
export async function fetchRead(
  url: string,
  timeout = 8000,
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(timeout),
      });
      if (attempt === 2 || ![500, 502, 503, 504].includes(response.status))
        return response;
      await response.body?.cancel();
    } catch (error) {
      if (attempt === 2) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
}
