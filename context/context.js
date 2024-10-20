import React, { createContext, useContext, useState, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import io from 'socket.io-client';

// Создаем контекст
export const AppContext = createContext();



export const AppProvider = ({ children }) => {
  const appVersion = "0.8.1"
  const [checkedVersion, setcheckedVersion] = useState(false);

  const [socket, setSocket] = useState("")

  // const CONNECTURL = "https://yaprikolist.ru"
  const CONNECTURL = Platform.OS === 'ios' ? 'http://localhost:9000' : 'http://10.0.2.2:9000';
  // const CONNECTURL = 'https://4979-2604-6600-1c6-2000-8331-32a5-fd3f-f347.ngrok-free.app'

  const [user, setUser] = useState(null);
  const [blockedVersion, setBlockedVersion] = useState(false);



  const createSocket = () => {
    const newSocket = Platform.OS === 'ios' ? io('http://localhost:9003') : io('http://10.0.2.2:9003')
    setSocket(newSocket)

    return newSocket;
  };


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



  const checkInternetConnection = async () => {
    const state = await NetInfo.fetch();
    if (!checkedVersion && state.isConnected) {
      console.log("Смена")
      checkInfoApp()
    }
    return state.isConnected;
  };


  const checkInfoApp = async () => {
    try {
      const response = await fetch(`${CONNECTURL}/checkappinfo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      const data = await response.json();
      if (data.info[0].version !== appVersion) { 
        
        setBlockedVersion(true)
        
      }
      setcheckedVersion(true)

    } catch (error) {
      console.error('Ошибка при получения сообщений:', error);
    }
  }


  return (
    <AppContext.Provider value={{ appVersion, user, setUser, blockedVersion, checkedVersion, checkInfoApp, checkInternetConnection, socket, createSocket, CONNECTURL }}>
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
    return useContext(AppContext)
}
