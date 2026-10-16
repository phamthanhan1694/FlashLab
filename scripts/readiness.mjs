/** Avoid sending requests through Vite until the API can actually answer. */
export async function probeDevReadiness(apiUrl, webUrl, fetcher = fetch) {
  for (const [stage, base] of [
    ['api', apiUrl],
    ['web', webUrl],
  ]) {
    try {
      const response = await fetcher(new URL('/api/health', base), {
        signal: AbortSignal.timeout(1500),
      });
      if (!response.ok || (await response.json()).status !== 'ok')
        return {
          ready: false,
          stage,
          message: `${stage === 'api' ? 'API' : 'Frontend'} chưa sẵn sàng (HTTP ${response.status})`,
        };
    } catch (error) {
      return {
        ready: false,
        stage,
        message: `${stage === 'api' ? 'API' : 'Frontend'} chưa phản hồi: ${error.message}`,
      };
    }
  }
  return { ready: true };
}
