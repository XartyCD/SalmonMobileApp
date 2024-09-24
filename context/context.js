import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Создаем контекст
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [blockedVersion, setBlockedVersion] = useState(false);

  const loadData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (e) {
      // Обработка ошибок при загрузке данных
      console.error("Failed to load data", e);
    }
    return null;
  };
  
  // Загрузить юзера при старте приложения
  React.useEffect(() => {
    loadData('user').then(savedUser => {
      if (savedUser) setUser(savedUser);
    });
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, blockedVersion, setBlockedVersion }}>
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
    return useContext(AppContext)
}
