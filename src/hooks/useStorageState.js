import { useState, useEffect, useCallback } from 'react';
import { dispatchState } from '../utils';

const setItem = (storage, key, value) => {
  if (value == null) {
    storage.removeItem(key);
  } else {
    storage.setItem(key, value);
  }
};

const useStorageStateFactory = (storage, key, initialState) => {
  const [state, setState] = useState(() => {
    const valueFromStorage = storage.getItem(key);
    if (valueFromStorage == null) {
      initialState = dispatchState(initialState);
      setItem(storage, key, initialState);
      return initialState;
    }
    return valueFromStorage;
  });

  const setStateProxy = useCallback(
    (newState) => {
      setState((oldState) => {
        newState = dispatchState(newState, oldState);
        setItem(storage, key, newState);
        return newState;
      });
    },
    [storage, key]
  );

  useEffect(() => {
    function handleStorage(storageEvent) {
      if (storageEvent.storageArea === storage && storageEvent.key === key) {
        setState(storageEvent.newValue);
      }
    }

    window.addEventListener('storage', handleStorage, { passive: true });

    return () => window.removeEventListener('storage', handleStorage);
  }, [storage, key]);

  return [state, setStateProxy];
};

export const useLocalStorageState = (key, initialState) =>
  useStorageStateFactory(localStorage, key, initialState);
export const useSessionStorageState = (key, initialState) =>
  useStorageStateFactory(sessionStorage, key, initialState);
