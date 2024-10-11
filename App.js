import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, TextInput, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext, AppProvider } from './context/context.js';
import BlockVersionScreen from './screens/BlockVersionScreen.js';
import WelcomeScreen from './screens/WelcomeScreen.js' 
import RatingScreen from './screens/RatingScreen.js';
import HomePage from './screens/HomePage.js';
import ChatScreen from './screens/ChatScreen.js';

import LobbyPongScreen from './screens/PongGameScreens/LobbyPongScreen.js';
import GamePongScreen from './screens/PongGameScreens/GamePongScreen.js';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';



const Stack = createStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppContent />
      </NavigationContainer>
    </AppProvider>
  );
}

function AppContent() {
  const { user, blockedVersion, checkInfoApp } = useAppContext(); // используем контекст внутри компонента AppContent
  console.log(blockedVersion)
  checkInfoApp()
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false, 
      cardStyle: { backgroundColor: 'white' }  // Устанавливаем фон для навигируемых страниц
    }}>
      {blockedVersion ? (
        // Если версия заблокирована, показываем экран блокировки версии
        <Stack.Screen
          name="BlockVersionScreen"
          component={BlockVersionScreen}
          options={{ gestureEnabled: false }} // Блокируем свайп-назад
        />
      ) : !user ? (
        // Если пользователь не авторизован, показываем экран приветствия
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      ) : (
        <>
          <Stack.Screen name="HomePage" component={HomePage} />
          <Stack.Screen name="RatingScreen" component={RatingScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="LobbyPongScreen" component={LobbyPongScreen} />
          <Stack.Screen name="GamePongScreen" component={GamePongScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
