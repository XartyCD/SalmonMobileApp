import { Platform, StyleSheet, ScrollView, TextInput, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/context.js';


// const CONNECTURL = "http://37.139.62.40:9000"
// const CONNECTURL = Platform.OS === 'ios' ? 'http://localhost:9000' : 'http://10.0.2.2:9000';


export default RatingScreen = ( { navigation } ) => { 
  const { user, setUser } = useContext(AppContext);
  const [rating, setRating] = useState([]); // Состояние для хранения рейтинга

  const globalRatingUpdate = async () => {
    try {
      const response = await fetch(`${CONNECTURL}/gettoprating`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      const data = await response.json();
      // Сортировка массива по полю 'balance' от большего к меньшему
      const sortedRating = data.rating.sort((a, b) => b.balance - a.balance);
      setRating(sortedRating);
      console.log(sortedRating);

    } catch (error) {
      console.error('Ошибка при получении рейтинга:', error);
    }
  }


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      globalRatingUpdate();
    });
  
    const intervalId = setInterval(globalRatingUpdate, 120000); // Проверка каждые 120 секунд
  
    // Очистка при размонтировании компонента и удалении слушателя
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [navigation]);
  
  return (
    <View style={styles.mainWrapper}>
      <View style={styles.topPanel}>
          <Text style={styles.chatName}>Рейтинг лучших лососей</Text>
      </View>
      <View style={styles.ratingWrapper}>
        <ScrollView>
          {Array.isArray(rating) ? (
            rating.map((rate, index) => (
              <View key={index} style={styles.messageBlock}>
                {rate.user === user ? (
                  <Text style={styles.messageYouUser}>{rate.user}</Text>
                ) : (
                  <Text style={styles.messageUser}>{rate.user}</Text> 
                )}
                <Text style={styles.messageText}>{rate.balance}</Text>
              </View>
            ))
          ) : (
            <Text>Вы не подключены к интернету</Text> // Сообщение, если сообщений нет
          )}
        </ScrollView>
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
