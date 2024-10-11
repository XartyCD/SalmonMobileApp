import { Platform, StyleSheet, TextInput, Text, View, Pressable, Image, Alert, Linking } from 'react-native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/context.js';


export default PongCreatePopup = ({ onClose }) => { 
  const { user, CONNECTURL, checkInternetConnection } = useAppContext()

  const [gameName, setgameName] = useState("")
  const [bet, setBet] = useState(0)

  const blackListNames = ["nigger", "Ниггер", "Нигер", "Зеленский", "Макрон", "Niga", "Nigga", "Негр", "Negr", "Райан Гослинг", "Пабло Эксобар", 
    "Байден", "Putin", "Путин", ".", "&", "?", "-", "~", "Зюзьга"]


  const createNewGame = async () => {
    const connected = await checkInternetConnection();
    if (connected) {
      if (gameName.length <= 3 || gameName === "") {
          // setnameWarn("Название слишком короткое (от 3-х)")
          alert(1)
        } else if (gameName.length > 16) {
          // setnameWarn("Название слишком длинное (до 15-ти)")
          alert(2)
        } else if (blackListNames.some(word =>
          gameName.toLowerCase().includes(word.toLowerCase()))) {
          // setnameWarn("Название неприемлимо")
          alert(3)
        } else if (isNaN(bet) || bet <= 0) {
          alert(4)
        } else {
          try {
            const response = await fetch(`${CONNECTURL}/createponggame`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
                body: JSON.stringify({ gameName, user, bet }),
              });
      
              const data = await response.json();

              if (!data.success) {
                throw new Error(data.message);
              }

              if (data.success === "already namegame") {
                alert('Название занято');
              }

              else {
              // createYourRating()
              console.log('Ответ сервера:', data);

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
  <View style={styles.popup_wrapper}>
    <Pressable
      onPress={onClose}
      style={{
        alignItems: "center",
        width: "100%",
        backgroundColor: "#ff6b6b",
        marginTop: 2,
        paddingVertical: 2,
        borderWidth: 2,       // Толщина рамки
        borderColor: '#545454db',   // Цвет рамки
        borderStyle: 'solid', // Тип рамки
        borderRadius: 8,
      }}
      >
      <Text>Закрыть</Text>
    </Pressable>

    <View style={styles.create_wrapper}>
      <View style={styles.create_inputs}>
        <View style={styles.input_name}>
          <Text>Название игры</Text>
          <TextInput
            style={styles.input}
            placeholder={`Игра игрока ${user}`}
            // Обновляем состояние при изменении текста
            onChangeText={e => setgameName(e)}
            // Привязка значения к input
          />
        </View>
        <View style={styles.input_bet}>
          <Text>Ставка</Text>
          <TextInput
            style={styles.input}
            placeholder="Ставка"
            // Обновляем состояние при изменении текста
            onChangeText={e => setBet(e)}
            // Привязка значения к input
          />
        </View>
      </View>
      <Pressable
        style={
        styles.create_button
        }
        onPress={createNewGame}
        ><Text>Добавить игру</Text>
      </Pressable>
    </View>
    
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
    height: "40%",
    backgroundColor: "#ffe5f8"
  }, 

  create_wrapper: {
    marginTop: 15,
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  create_button: {
    padding: 10,
    backgroundColor: "#fcce72",
    borderRadius: 30,
  }})

