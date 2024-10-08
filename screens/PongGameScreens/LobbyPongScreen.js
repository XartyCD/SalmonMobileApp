import { Platform, StyleSheet, TextInput, ScrollView, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AppContext } from '../context/context.js';


// const CONNECTURL = "https://yaprikolist.ru"
const CONNECTURL = Platform.OS === 'ios' ? 'http://localhost:9000' : 'http://10.0.2.2:9000';
// const CONNECTURL = 'https://4979-2604-6600-1c6-2000-8331-32a5-fd3f-f347.ngrok-free.app'

export default ChatScreen = ( { navigation } ) => { 

  const { user, setUser } = useContext(AppContext);
  const [sendWarn, setsendWarn] = useState("");
  const [sendingMessage, setSendingMessage] = useState(null);
  const [messages, setMessages] = useState([]); // Состояние для хранения сообщений
  const scrollViewRef = useRef()
  const [isAtBottom, setIsAtBottom] = useState(true);


  const ListGamesUpdate = async () => {
    try {
      const response = await fetch(`${CONNECTURL}/getlistgames`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      const data = await response.json();

      if (data.messages !== messages) { 
        // Если массив сообщений изменился, обновляем state
        setMessages(data.messages);
        
      }

    } catch (error) {
      console.error('Ошибка при получения сообщений:', error);
    }
  }




  useEffect(() => {
    ListGamesUpdate(); // Запрос на обновление сообщений при первом входе
    const intervalId = setInterval(ListGamesUpdate, 1500); // Обновление сообщений каждые 2.3 секунды

    return () => clearInterval(intervalId); // Очищаем интервал при размонтировании компонента
  }, []);
  
  return (
    <View style={styles.mainWrapper}>
      <View style={styles.topPanel}>
          <Text style={styles.chatName}>Список Игровых Сессий</Text>
      </View>
      <View style={styles.chatWrapper}>
        <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
          >
          {Array.isArray(messages) && messages.length > 0 ? (
            messages.map((message, index) => (
              <View key={index} style={styles.messageBlock}>
                {message.user === user ? (
                  <Text style={styles.messageYouUser}>{message.user}</Text>
                ) : (
                  <Text style={styles.messageUser}>{message.user}</Text> 
                )}
                <Text style={styles.messageText}>{message.message}</Text>
                <Text style={styles.messageTime}>{new Date(message.time).toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text>No messages available</Text> // Сообщение, если сообщений нет
          )}
        </ScrollView>
      </View>
      <View style={styles.inputChatWrapper}>
        <View style={styles.inputWrapper}>
          <TextInput
              style={styles.inputChat}
              placeholder="Сообщение"
              onChangeText={e => setSendingMessage(e)}
              value={sendingMessage}
              onSubmitEditing={sendMessage}
          />
        </View>
      <View>
        <Pressable
            style={
            styles.sendButton
            }
            onPress={sendMessage}
            ><Image
            source={require('../assets/images/sendIcon.png')}
            style={{
              width: 33,
              height: 33,
            }}
            resizeMode="cover"
          />
        </Pressable>
      </View>
      </View>
    </View>
  )
};


const styles = StyleSheet.create({
  mainWrapper: {
    marginTop: 48.9,
    marginBottom: 20, 
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
    height: "85%",
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
  messageTime: {
    marginTop: 8.8,
    fontSize: 12,
    color: '#555',
    textAlign: 'right',
  },

  inputChatWrapper: {
    justifyContent: "space-between",
    maxWidth: "100%",
    flexDirection: 'row',
    alignItems: "center",
    textAlign: "center",
    marginTop: 5,
    marginHorizontal: 2
  },

  inputWrapper: {
    width: "91%",
    borderWidth: 2,       // Толщина рамки
    borderColor: '#545454db',   // Цвет рамки
    borderStyle: 'solid', // Тип рамки
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },


  inputChat: {
    fontSize: 20,
    maxWidth: "100vw"
  },

  sendButton: {
    width: "100%"
  }
  
})
