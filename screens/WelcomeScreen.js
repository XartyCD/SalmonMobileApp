import { Platform, StyleSheet, TextInput, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useAppContext } from '../context/context.js';
import NetInfo from '@react-native-community/netinfo';



export default WelcomeScreen = ( { navigation } ) => { 
  const [nameWarn, setnameWarn] = useState("хэ")
  const { user, setUser, appVersion, checkInternetConnection, CONNECTURL } = useAppContext();
  const [checkedNewName, setCheckNewName] = useState(null);
  const blackListNames = ["nigger", "Ниггер", "Нигер", "Зеленский", "Макрон", "Niga", "Nigga", "Негр", "Negr", "Райан Гослинг", "Пабло Эксобар", 
    "Байден", "Putin", "Путин", ".", "&", "?", "-", "~", "Зюзьга"]

  // Проверка состояния сети при первом рендере компонента и каждые 60 секунд
  useEffect(() => {
    checkInternetConnection(); // Проверка при первом рендере

    // const intervalId = setInterval(checkInternetConnection, 60000); // Проверка каждые 20 секунд

    // // Очистка интервала при размонтировании компонента
    // return () => clearInterval(intervalId);
  }, []);

  const createYourRating = async () => {
    const connected = await checkInternetConnection();
    if (connected) { 
      try {
        const response = await fetch(`${CONNECTURL}/createyourrating`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ checkedNewName, balance: 0 }), // Укажите balance как свойство объекта
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        } else {
          console.log('Личный рейтинг создан');
        }
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
      }
    }
  };
  
  
  const saveUserName = async () => {
    const connected = await checkInternetConnection();
      if (connected) {
        if (checkedNewName.length <= 4 || checkedNewName === "") {
          setnameWarn("Слишком короткий! (от 4-х)")
        } else if (checkedNewName.length > 16) {
          setnameWarn("Слишком длинный (до 16-ти)")
        } else if (blackListNames.some(word =>
          checkedNewName.toLowerCase().includes(word.toLowerCase()))) {
          setnameWarn("Имя неприемлимо")
        } else {
          try {
            const response = await fetch(`${CONNECTURL}/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ checkedNewName }),
            });
      
            const data = await response.json();

            if (!data.success) {
              throw new Error(data.message);
            }

            if (data.success === "already user") {
              alert('Такой лосось уже существует');
            }

            else {
              createYourRating()
              console.log('Ответ сервера:', data);
        
              setUser(checkedNewName); // Записываем валидное введенное имя в состояние
            }
        
          } catch (error) {
            console.error('Ошибка при отправке данных:', error);
          }
        }
      } else {
        setnameWarn("Нет подключения к интернету!")
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

        <Text style={styles.version}>v.{appVersion}</Text>
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
  },
  version: {
    margin: 100,
    fontSize: 14,
    color: "#e307b3"
  }
})
