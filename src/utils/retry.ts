import fetchRetry from 'fetch-retry';
export const fetchWithRetry = fetchRetry(global.fetch, {
  retries: 10,
  retryDelay: (attempt) => Math.pow(2, attempt) * 250,
  retryOn: (attempt, error, response) => {
    // retry on network error or any 5xx status code
    if (error !== null) {
      return true;
    }
    if (response && response.status >= 500 && response.status < 600) {
      return true;
    }
    return false;
  },
});
