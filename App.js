import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, TextInput, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { useAppContext, AppProvider } from './context/context.js';
import SaveLoader from './screens/SaveLoader.js'
import WelcomeScreen from './screens/WelcomeScreen.js'
import HomePage from './screens/HomePage.js'

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="auto" />
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const { user } = useAppContext(); // используем контекст внутри компонента AppContent

  return user ? 
    <HomePage /> 
    : 
    <WelcomeScreen />;
}



