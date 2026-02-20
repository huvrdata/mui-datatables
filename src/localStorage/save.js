const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const save = (storageKey, state) => {
  if (isBrowser) {
    try {
      const { selectedRows, data, displayData, ...savedState } = state;

      window.localStorage.setItem(storageKey, JSON.stringify(savedState));
    } catch (err) {
      // Catch errors in case localStorage is unavailable
    }
  }
};
