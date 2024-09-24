import { Platform, StyleSheet, TextInput, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/context.js';


// const CONNECTURL = "http://37.139.62.40:9000"
const CONNECTURL = Platform.OS === 'ios' ? 'http://localhost:9000' : 'http://10.0.2.2:9000';


export default BlockVersionScreen = () => { 
  const { user } = useContext(AppContext)

  
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
            onPress={() => alert("Обновись!!")}
            ><Text>Продолжить</Text>
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
