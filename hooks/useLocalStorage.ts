import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Effect to save state to localStorage and notify other hooks
  useEffect(() => {
    try {
      const valueToStore =
        typeof storedValue === 'function'
          ? storedValue(storedValue)
          : storedValue;
      
      const currentValueInStorage = window.localStorage.getItem(key);
      const newValueString = JSON.stringify(valueToStore);
      
      if (currentValueInStorage !== newValueString) {
          window.localStorage.setItem(key, newValueString);
          // Dispatch a generic storage event that other components can listen to.
          window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  // Effect to listen for storage events from other components/tabs
  useEffect(() => {
    const handleStorageChange = () => {
        try {
            const item = window.localStorage.getItem(key);
            // By parsing and stringifying, we can do a deep-enough compare for this app's data structures
            // to avoid unnecessary re-renders and potential loops if the data is identical.
            if (JSON.stringify(storedValue) !== item) {
                setStoredValue(item ? JSON.parse(item) : initialValue);
            }
        } catch (error) {
            console.error(`Error reloading from storage for key "${key}":`, error);
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;