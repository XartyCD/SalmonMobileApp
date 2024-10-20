import { Platform, StyleSheet, TextInput, Text, View, Pressable, Image, Alert, Linking } from 'react-native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useAppContext } from '../context/context.js';


export default ExchangerPopup = ({ onClose }) => { 
  const { user, CONNECTURL } = useAppContext()


  const openLink = async () => {
    const url = 'https://yaprikolist.ru';
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Не удалось открыть URL: ${url}`);
    }
  };

  
  return (
    <View style={styles.popup_wrapper}>
      
        <Text>{user}, Обменник</Text>
        <Pressable
            onPress={onClose}
            ><Image
            source={require('../assets/images/closeIcon.png')}
            style={{
              width: 50,
              height: 50,
            }}
            resizeMode="cover"
          />
        </Pressable>
    </View>
  )
  };


const styles = StyleSheet.create({
  popup_wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0, // растянуть на всю ширину
    zIndex: 1, // компонент поверх других
    width: "100%",
    height: "88%",
    backgroundColor: "#9f89f5b3"
  }, 
  topButton: {
    padding: 10,
    backgroundColor: "#c7c7c7d2",
    borderRadius: 30,
  }})
