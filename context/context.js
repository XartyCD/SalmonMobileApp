import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import io from 'socket.io-client';

// Создаем контекст
export const AppContext = createContext();


export const AppProvider = ({ children }) => {
  const appVersion = "0.8.8"
  const [socket, setSocket] = useState("")

  // const CONNECTURL = "https://yaprikolist.ru/api"
  const CONNECTURL = Platform.OS === 'ios' ? 'http://localhost:9000/api' : 'http://10.0.2.2:9000/api';
  // const CONNECTURL = 'https://4979-2604-6600-1c6-2000-8331-32a5-fd3f-f347.ngrok-free.app'

  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [blockedVersion, setBlockedVersion] = useState(false);
  const blockedVersionRef = useRef(blockedVersion);



  const createSocket = () => {
    const newSocket = Platform.OS === 'ios' ? io('http://localhost:9003') : io('http://10.0.2.2:9003')
    setSocket(newSocket)

    return newSocket;
  };


  // Вывод AsyncStorage в консоль (для отладки)
  async function getAllDataFromAsyncStorage() {
    try {
      // Получаем все ключи
      const keys = await AsyncStorage.getAllKeys();

      // Получаем все пары ключ-значение
      const result = await AsyncStorage.multiGet(keys);

      // Преобразуем результат в объект для удобства использования
      const allData = result.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

      console.log("Все данные из AsyncStorage:", allData);
      return allData;
    } catch (error) {
      console.error("Ошибка при получении данных из AsyncStorage:", error);
    }
  }



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


  // Загрузить имя юзера при старте приложения (чтобы сразу перекидывать в аккаунт если имя в сторэдже)
  React.useEffect(() => {
    loadData('user').then(savedUser => {
      if (savedUser) setUser(savedUser);
    });
    loadData('sessionId').then(savedSession => {
      if (savedSession) setSessionId(savedSession);
    });
  }, []);

  // Проверка интернета (вынесено через контекст)
  const checkInternetConnection = async (needCheckVersion = false, needCheckSession = false) => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      if (needCheckVersion) {
        let sessionRes // объявление чтобы по умолчанию была false
        console.log("Проверка инета (+ версии)")
        const res = await checkInfoApp()   // Автоматическая проверка версии после проверки интернета
        if (needCheckSession) {
          sessionRes = await checkSession()
        }


        if (res || sessionRes) {
          return false
        } else {
          return true // если все исправно
        }
      } else {
        console.log("Проверка инета")
        return true
      }
    } else {
      return false // По умолчанию инет false, версия не проверяется
    }
  };

  // Проверка версии (вынесено через контекст)
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

        console.log(appVersion, data.info[0].version)

        blockedVersionRef.current = true

        setBlockedVersion(true)

        return true

      } else {
        console.log(appVersion, data.info[0].version, false)

        blockedVersionRef.current = false

        setBlockedVersion(false)

        return false
      }

    } catch (error) {
      console.error('Ошибка при проверке версии приложения:', error);
    }
  }


  // Проверка id сессии (вынесено через контекст)
  const checkSession = async () => {
    try {
      console.log(sessionId)
      const response = await fetch(`${CONNECTURL}/checksessionid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user,
          sessionId
        }),
      })

      const data = await response.json();

      if (data.message === "Сессия недействительна") {

        console.log("Сессия недействительна")

        // очищать локальные данные 
        await AsyncStorage.clear()

        // Сбрасываем состояния
        setUser(null)

        return true

      } else {
        console.log("Все хАрАшо")

        return false
      }

    } catch (error) {
      console.error('Ошибка при проверке id сессии:', error);
    }
  }


  return (
    <AppContext.Provider value={{ getAllDataFromAsyncStorage, appVersion, user, setUser, sessionId, setSessionId, blockedVersion, blockedVersionRef, checkInfoApp, checkInternetConnection, socket, createSocket, CONNECTURL }}>
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  return useContext(AppContext)
}
