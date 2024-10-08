import { Platform, StyleSheet, TextInput, Text, View, Pressable, Image, Alert, Linking } from 'react-native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useAppContext } from '../context/context.js';



export default BlockVersionScreen = () => { 
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

        <Pressable
            style={
            styles.bottomButton
            }
            onPress={() => {alert("navigate....")}}
            ><Text>Продолжить на старой версии</Text>
        </Pressable>
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
