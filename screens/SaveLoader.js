import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, StyleSheet, TextInput, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { useAppContext, AppProvider } from '../context/context.js';

const CONNECTURL = "http://37.139.62.40:9000"

export default function SaveLoader() {
  const { user, setUser } = useAppContext();
  const [balance, setBalance] = useState(0);
  const [countTap, setcountTap] = useState(0);
  const [priceUpgradeTap, setpriceUpgradeTap] = useState(0);


  const saveData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Обработка ошибок при сохранении данных
      console.error("Failed to save data", e);
    }
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
  
  // Загрузить данные при старте приложения
  React.useEffect(() => {
    loadData('user').then(savedUser => {
      if (savedUser) setUser(savedUser);
    });
    
    loadData('balance').then(savedBalance => {
      if (savedBalance) setBalance(savedBalance);
    });

    loadData('countTap').then(countTap => {
      if (countTap) setcountTap(countTap);
    });

    loadData('priceUpgradeTap').then(priceUpgradeTap => {
      if (priceUpgradeTap) setpriceUpgradeTap(priceUpgradeTap);
    });
  }, []);

  // Сохранение данных при изменении состояния
  React.useEffect(() => {
    if (user !== null) {
      saveData('user', user)};
      saveData('balance', balance)
      saveData('countTap', countTap)
      saveData('priceUpgradeTap', priceUpgradeTap)
  }, [user, balance, countTap, priceUpgradeTap]);

  return (
        <View style={styles.header}>
          <Text style={styles.title}>Прогрузка данных...</Text>
        </View> 
  )
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: "red",
    fontSize: 20
  }, 
  upgradeButtonStyle: {
    padding: 15,
    backgroundColor: "purple",
    borderRadius: 5,
  }, 
  upgradeTextButtonStyle: {
    color: 'white',
    fontSize: 15,
  }
});
