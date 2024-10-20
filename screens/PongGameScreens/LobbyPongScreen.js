import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, ScrollView, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useAppContext } from '../../context/context.js';

import ShopPopup from './PongCreatePopup.js';

import io from 'socket.io-client';


export default LobbyPongScreen = ( { navigation }) => { 
  const { createSocket, user, CONNECTURL } = useAppContext();

  const [showCreate, setShowCreate] = useState(false);
  const [createIcon, setCreateIcon] = useState(require('../../assets/images/createPongGameIcon.png'));

  const [ponggames, setPonggames] = useState([]); // Состояние для хранения игр



  const ListGamesUpdate = async () => {
    try {
      const response = await fetch(`${CONNECTURL}/getlistgames`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      const data = await response.json();

      if (data.ponggames !== ponggames) { 
        console.log(data.ponggames)
        setPonggames(data.ponggames);
        
      }

    } catch (error) {
      console.error('Ошибка при получения сообщений:', error);
    }
  }

  const joinPongGame = (game_id, playerName) => {
    const socket = createSocket()
    socket.emit('joingame', { game_id, playerName });  // Отправляем данные на сервер
    console.log(typeof game_id)
  
    // Ожидаем ответа от сервера
    socket.on('startGame', game_id => {
      alert('Игра началась!')

      navigation.navigate('GamePongScreen', { game_id, playerName, playerNumber: 2 });
    });
  
    socket.on('error', (errorMessage) => {
      console.error('Ошибка:', errorMessage);
      Alert.alert('Ошибка', errorMessage);
    });
  };


  const showerCreate = () => {
    showCreate ? setCreateIcon(require('../../assets/images/createPongGameIcon.png')) : setCreateIcon(require('../../assets/images/closeCreatePongGameIcon.png'))
    setShowCreate(!showCreate)
  }

  // const sendMessage = async () => {
  //   if (sendingMessage === "" || sendingMessage === "." || sendingMessage.length >= 120) {
  //     setnameWarn("Такое здесь не одобряют")

  //   } else {
  //     try {
  //       const response = await fetch(`${CONNECTURL}/pongCreateGame`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ user, sendingMessage }),
  //       });
  
    
  //       const data = await response.json();

  //       if (!data.success) {
  //         throw new Error(data.message);
  //       }

  //       else {
  //         globalChatUpdate()
  //         setSendingMessage("")
  //         console.log('Сообщение успешно добавлено');
  //         console.log('Ответ сервера:', data);
  //       }
    
  //     } catch (error) {
  //       console.error('Ошибка при отправке данных:', error);
  //     }
  //   }
  // }


  useEffect(() => {
    ListGamesUpdate(); // Запрос на обновление сообщений при первом входе
    const intervalId = setInterval(ListGamesUpdate, 250000); // Обновление списка игр каждые 2.5 секунды

    return () => clearInterval(intervalId); // Очищаем интервал при размонтировании компонента
  }, []);
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // На iOS сдвиг будет работать через padding, а на Android через height (иначе на android рывки при появлении)
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 70}
    >
    <View style={styles.mainWrapper}>
      {showCreate && <PongCreatePopup onClose={showerCreate} navigation={navigation}/>}

      <View style={styles.topPanel}>
          <Text style={styles.chatName}>Список Игровых Сессий</Text>
      </View>
      <View style={styles.chatWrapper}>
        <ScrollView>
        <Pressable
            style={{
              width: 50,
              height: 50,
            }}
            onPress={showerCreate}
            >
            <Image
            source={createIcon}
            style={{
              width: 50,
              height: 50,
            }}
            resizeMode="cover"
          />
        </Pressable>
          {Array.isArray(ponggames) && ponggames.length > 0 ? (
            ponggames.map((game, index) => (
              <View key={index} style={styles.gameSessionBlock}>
                <Text style={styles.gamename}>{game.gamename}</Text> 
                <Text style={styles.gamecreator}>{game.player1}</Text>
                <Text style={styles.gamebet}>{game.bet}</Text>

                <Pressable
                  style={styles.gameButton}
                  onPress={() => joinPongGame(Number(game.game_id), user)}
                >
                  <Text style={styles.buttonText}>Присоединиться</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text>Нет созданных игровых сессий</Text> // Сообщение, если актуальных игр нет
          )}
        </ScrollView>
      </View>
    </View>
    </KeyboardAvoidingView>
  )
};


const styles = StyleSheet.create({
  mainWrapper: {
    marginTop: 48.9,
    flexDirection: "column"
  },
  topPanel: {
    backgroundColor: "#6d95b3cd",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20
  },
  chatName: {
    fontSize: 21,
    color: "white"
  },

  chatWrapper: {
    backgroundColor: "#ecebffcd",
    height: "100%",
    width: "100%",
  },

  
  gameSessionBlock: {
    backgroundColor: '#8dd4d9e4',
    paddingTop: 8,
    paddingBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 11,
    marginTop: 11,
    marginBottom: 7,
    marginHorizontal: 12,
  },

  gamename: {
    fontWeight: 'bold',
    color: "white",
    fontSize: 22,
  },

  gamecreator: {
    fontWeight: 'bold',
    color: "#4f4f4fcd",
    fontSize: 17,
  },
  gamebet: {
    marginTop: 5,
  },
})
