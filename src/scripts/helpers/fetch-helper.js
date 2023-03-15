export const retryFetch = (url, options = {}, retries = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
    const doFetch = attempt => {
      fetch(url, options)
        .then(response => {
          if (response.ok) {
            resolve(response);
          } else if (attempt < retries) {
            setTimeout(() => doFetch(attempt + 1), delay);
          } else {
            reject(response);
          }
        })
        .catch(error => {
          if (attempt < retries) {
            setTimeout(() => doFetch(attempt + 1), delay);
          } else {
            reject(error);
          }
        });
    };
    doFetch(0);
  });
};
