import { Platform, StyleSheet, TextInput, Text, View, Pressable, Image, Alert, Linking } from 'react-native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAppContext } from '../context/context.js';




export default BlockVersionScreen = () => {
  const { user, CONNECTURL } = useAppContext()


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


  const openLink = async () => {
    const url = 'https://yaprikolist.ru';
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Не удалось открыть URL: ${url}`);
    }
  };



  useEffect(() => {
    const removeStorage = async () => {
      try {
        // Получаем все ключи
        const allKeys = await AsyncStorage.getAllKeys();

        // Фильтруем ключи, оставляя только те, которые не связаны с "user"
        const keysToRemove = allKeys.filter(key => key !== 'user');

        // Удаляем все ключи, кроме "user"
        if (keysToRemove.length > 0) {
          await AsyncStorage.multiRemove(keysToRemove);
        }

        console.log('Все данные, кроме user, были удалены из AsyncStorage');

        await getAllDataFromAsyncStorage()
      } catch (error) {
        console.error('Ошибка при очистке AsyncStorage: ', error);
      }
    }

    removeStorage()
  }, []);


  return (
    <View style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Text>{user}, ваша версия приложения устарела, обновитесь</Text>
      <Pressable
        style={
          styles.topButton
        }
        onPress={openLink}
      ><Text>Обновить версию</Text>
      </Pressable>

      {/* <Pressable
            style={
            styles.bottomButton
            }
            onPress={() => {alert("navigate....")}}
            ><Text>Продолжить на старой версии</Text>
        </Pressable> */}
    </View>
  )
};


const styles = StyleSheet.create({
  warnSetNickname: {
    padding: 4,
    backgroundColor: "#ff4f4fdb",
    color: "white",
    fontSize: 16,
  },
  topButton: {
    padding: 10,
    backgroundColor: "#c7c7c7d2",
    borderRadius: 30,
  }
})
