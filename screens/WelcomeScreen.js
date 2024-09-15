import { StyleSheet, TextInput, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/context.js';

const CONNECTURL = "http://37.139.62.40:9000"

export default WelcomeScreen = () => { 
  const [nameWarn, setnameWarn] = useState("")
  const { user, setUser } = useContext(AppContext);
  const [checkedNewName, setCheckNewName] = useState(null);
  const blackListNames = ["nigger", "Ниггер", "Нигер", "Niga", "Nigga", "Негр", "Negr", "Райан Гослинг", "Пабло Эксобар", 
    "Трамп", "Putin", "Путин", " ", ".", "&", "?", "-", "~", "Зюзьга"]
  
  const saveUserName = async () => {
      if (checkedNewName.length <= 4 || checkedNewName === "") {
        setnameWarn("Слишком короткий! (от 4-х)")
      } else if (checkedNewName.length > 16) {
        setnameWarn("Слишком длинный (до 16-ти)")
      } else if (blackListNames.some(word =>
        checkedNewName.toLowerCase().includes(word.toLowerCase()))) {
        setnameWarn("Имя неприемлимо")
      } else {
        
        try {
          const currentTime = new Date().toISOString();
          const response = await fetch(`${CONNECTURL}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ checkedNewName, currentTime }),
          });
      
          // Проверяем, что запрос успешен
          if (!response.ok) {
            throw new Error(`Ошибка: ${response.statusText}`);
          }
      
          const data = await response.json();
      
          console.log('Ответ сервера:', data);
      
          setUser(checkedNewName); // Записываем валидное введенное имя в состояние
        } catch (error) {
          console.error('Ошибка при отправке данных:', error);
        }
      }
    }
  return (
    <View style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
        }}>
        <Text style={styles.warnSetNickname}>{nameWarn}</Text>
        <Text>Как назвать вашего лосося?</Text>
        <TextInput
            style={styles.input}
            placeholder="Имя лосося"
            // Обновляем состояние при изменении текста
            onChangeText={e => setCheckNewName(e)}
            // Привязка значения к input
        />
        <Pressable
            style={
            styles.topButton
            }
            onPress={saveUserName}
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
