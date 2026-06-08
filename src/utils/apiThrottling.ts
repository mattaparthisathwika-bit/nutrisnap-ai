/**
 * Manages API call throttling to avoid hitting OpenAI rate limits
 */

let lastApiCall = 0;
const THROTTLE_DELAY_MS = 1000; // Wait 1 second between requests
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 2000;

export async function throttledApiCall<T>(
  apiFunction: () => Promise<T>,
  functionName: string = 'API Call'
): Promise<T> {
  // Wait until throttle delay has passed
  const timeSinceLastCall = Date.now() - lastApiCall;
  if (timeSinceLastCall < THROTTLE_DELAY_MS) {
    const waitTime = THROTTLE_DELAY_MS - timeSinceLastCall;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastApiCall = Date.now();

  // Retry with exponential backoff
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await apiFunction();
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const isTokenError = errorMessage.includes('token') || 
                          errorMessage.includes('rate_limit') ||
                          errorMessage.includes('429');
      
      if (!isTokenError || attempt === MAX_RETRIES) {
        throw error;
      }

      // Exponential backoff: 2s, 4s, 8s
      const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
      console.warn(
        `[${functionName}] Rate limited. Retrying in ${backoffTime}ms... (Attempt ${attempt}/${MAX_RETRIES})`
      );
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }

  throw new Error('Max retries exceeded');
}
