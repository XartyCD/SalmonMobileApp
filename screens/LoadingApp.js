import { Platform, StyleSheet, TextInput, Text, View, Pressable, Image, Animated } from 'react-native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useAppContext } from '../context/context.js';



export default function LoadingScreen() {
  const [loadingText, setLoadingText] = useState("Загрузка")
  const [loadingTextDots, setLoadingTextDots] = useState('.'); // состояние для точек

  const phrasesArray = ["Рассаживаем лососей по кустам", "Рассаживаем ботов в чат",
      "Жестко программируем движок для пинг-понга", "Генерируем топ из ноунеймов",
      "Баним кого попало", "Выдумываем новый вид лососей",
      "Рисуем новые скины", "Пампим BBCoin",
      "Симулируем важную загрузку", "Делаем вид что что-то грузим",
      "Готовим лососей к захвату Польши", "Рассказываем лососям, как плавать лучше",
      "Ищем лучших диванных войнов в водах чата", "Учим чат-ботов ругаться нецензурной бранью",
      "Ловим баги на удочку и отпускаем обратно", "Развиваем дружбу между рыбами и ботами",
      "Запускаем марафон по программированию для рыб", "Обсуждаем, как улучшить подводный интернет",
      "Интересный факт: Лоситлер не умел разгонять процессоры RX5600", "Изучаем поведение рыб в условиях стресса",
      "Лососи с высшим образованием: миф или реальность?", "Очищаем кнопки от жирных пальцев",
      "Обсуждаем, как черника вдохновляет программистов", "Кодим приложение для учета черничного урожая",
      "Мыслим о великом", "Забиваем на важное и добавляем ненужное"]


  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Интервал для изменения фразы
    setLoadingText(phrasesArray[Math.floor(Math.random() * phrasesArray.length)])
    const textInterval = setInterval(() => {
      fadeOut(() => {
        changeLoadText();
        fadeIn();
      });
    }, 2500);
    
  
    
    // Интервал для обновления точек
    const dotsInterval = setInterval(updateDots, 900); 

    return () => {
      clearInterval(textInterval); // очищаем таймер при размонтировании
      clearInterval(dotsInterval); // очищаем таймер при размонтировании
    };
  }, []);

  const changeLoadText = () => {
    const phrase = phrasesArray[Math.floor(Math.random() * phrasesArray.length)]
    setLoadingText(phrase)
  }

  const updateDots = () => {
    // Увеличиваем кол-во точек, но ограничиваем до 3
    setLoadingTextDots(prevDots => (prevDots.length < 3 ? prevDots + '.' : '.'));
  };


  const fadeOut = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(callback);
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };


  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/appLoading.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.textsContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.outlineText}>{loadingText}{loadingTextDots}</Text>
          <Text style={styles.text}>{loadingText}{loadingTextDots}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },

  textsContainer: {
    zIndex: 1,
    maxHeight: 400,
    width: 360,
    justifyContent: "center",
    alignItems: 'center', // Выравнивание по центру
    backgroundColor: "#4f4f4f7a",
    marginTop: 400,

    paddingVertical: 6,
    paddingHorizontal: 10,
    borderColor: "black", // Цвет рамки
    borderStyle: "solid", // Тип рамки
    borderWidth: 1.5, // Толщина рамки (добавьте, если рамка не отображается)
    borderRadius: 8,
  },
  text: {
    textAlign: "center",
    color: '#a6ffe4e4',
    fontSize: 28,
    fontWeight: 'bold',
  },
  outlineText: {
    textAlign: "center",
    color: 'black', // Цвет обводки
    fontSize: 28,
    fontWeight: 'bold',
    position: 'absolute', // Позволяет наложить текст
    textShadowColor: 'black', // Цвет тени
    textShadowOffset: { width: 1, height: 0 }, // Смещение тени
    textShadowRadius: 1, // Радиус размытия тени
  },
});

