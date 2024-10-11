import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, ScrollView, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AppContext } from '../../context/context.js';

import ShopPopup from './PongCreatePopup.js';



// const CONNECTURL = "https://yaprikolist.ru"
const CONNECTURL = Platform.OS === 'ios' ? 'http://localhost:9000' : 'http://10.0.2.2:9000';
// const CONNECTURL = 'https://4979-2604-6600-1c6-2000-8331-32a5-fd3f-f347.ngrok-free.app'

export default LobbyPongScreen = ( { navigation } ) => { 
  const { user, setUser } = useContext(AppContext);

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
        setPonggames(data.ponggames);
        
      }

    } catch (error) {
      console.error('Ошибка при получения сообщений:', error);
    }
  }


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
      {showCreate && <PongCreatePopup onClose={showerCreate}/>}

      <View style={styles.topPanel}>
          <Text style={styles.chatName}>Список Игровых Сессий</Text>
      </View>
      <View style={styles.chatWrapper}>
        <ScrollView>
        <Pressable
            style={
            styles.sendButton
            }
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
              <View key={index} style={styles.pongBlock}>
                <Text style={styles.pongUser}>{game.user}</Text> 
                <Text style={styles.messageText}>{game.difficult}</Text>
                <Text style={styles.messageText}>{game.bet}</Text>
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

  messageBlock: {
    backgroundColor: '#e0e0e0',
    paddingTop: 8,
    paddingBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 11,
    marginTop: 11,
    marginBottom: 7,
    marginHorizontal: 12,
    width: "auto",
    maxWidth: 450,
    height: "auto",

  },

  messageYouUser: {
    fontWeight: 'bold',
    color: "#948b38cd",
    fontSize: 20
  },

  messageUser: {
    fontWeight: 'bold',
    color: "#4f4f4fcd",
    fontSize: 17
  },
  messageText: {
    marginTop: 5,
  },
})
