const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const load = (storageKey) => {
  if (isBrowser) {
    try {
      const serializedState = window.localStorage.getItem(storageKey);
      if (serializedState === null) {
        return undefined;
      }
      return JSON.parse(serializedState);
    } catch (err) {
      // Catch errors in case localStorage is unavailable
      return undefined;
    }
  } else if (storageKey !== undefined) {
    console.warn('storageKey support only on browser');
    return undefined;
  }
};
