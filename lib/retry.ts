/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param maxAttempts Maximum number of retry attempts (default: 3)
 * @param baseDelay Base delay in ms (default: 1000)
 * @returns Promise with function result
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxAttempts) {
                throw lastError;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`);

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}
