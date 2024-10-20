import { Platform, StyleSheet, TextInput, Text, View, Pressable, Image, Alert, Linking } from 'react-native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/context.js';

import io from 'socket.io-client';

export default PongCreatePopup = ({ navigation, onClose }) => { 

  const { user, createSocket, CONNECTURL, checkInternetConnection } = useAppContext()

  const [gameName, setgameName] = useState(`Игра игрока ${user}`)
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
        } else if (isNaN(bet) || bet <= 0) { // Сделать норм ввод цифры
          alert(4)
        } else {
          try {
            const socket = createSocket()
            socket.emit('createGame', gameName, user, bet);

            socket.on('createGameSuccess', (data) => {
              if (data.success) {
                console.log(`Игра успешно создана с id: ${data.game_id}`);  // number
                
                // Навигация на экран игры с game_id
                navigation.navigate('GamePongScreen', { game_id: data.game_id, playerName: user });
                alert("Игра успешно создана!");
                
              } else {
                console.error('Ошибка создания игры:', data.message);
              }
            });
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

