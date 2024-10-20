import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { useAppContext } from '../../context/context.js';
import io from 'socket.io-client';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;


export default function GamePongScreen({  route } ) {
  const { socket, user, CONNECTURL } = useAppContext();

  const { game_id, playerName, playerNumber } = route.params

  const [gameId, setGameId] = useState(game_id || null);
  const [isWaiting, setIsWaiting] = useState(false);

  const [playerPosition, setPlayerPosition] = useState({ x: screenWidth / 2, y: screenHeight - 50 });
  const [opponentPosition, setOpponentPosition] = useState({ x: screenWidth / 2, y: 50 });

  const [ballPosition, setBallPosition] = useState({ x: screenWidth / 2, y: screenHeight / 2 });
  const [ballSpeed, setBallSpeed] = useState({ x: 4, y: 4 }); // Скорость мяча по X и Y


  // Управление движением игрока
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => !isWaiting,
    onPanResponderMove: (e, gestureState) => {
      const newPos = { x: gestureState.moveX - 50, y: playerPosition.y };
      setPlayerPosition(newPos);
      if (gameId) {
//
        socket.emit('playerMove', { game_id: gameId, position: { x: gestureState.moveX - 50, y: 50 } });
      }
    },
  });

  useEffect(() => {
    // Старт игры при присоединении второго игрока
    socket.on('go', () => {
      console.log(123)
      setIsWaiting(false);
    });

    // // Обновление позиций игроков
    socket.on('updateGame', (players) => {
      const opponent = Object.values(players).find((player) => player.playerName !== user);
      if (opponent) {
        setOpponentPosition(opponent.position); // Обновляем позицию противника
      }
    });


    // Логика получения позиции мяча с сервера
    socket.on('updateBall', (ballData) => {
      const newX = playerNumber === 2 ? screenWidth - ballData.x : ballData.x; // Инверсия оси X
      const newY = playerNumber === 2 ? screenHeight - ballData.y : ballData.y; // Инверсия оси Y
      setBallPosition({ x: newX, y: newY });
    });



    // Очистка соединения при выходе
    return () => {
      socket.disconnect();
    };
  }, []);

  // Функция для передвижения мяча
  const moveBall = () => {
    let newX = ballPosition.x + ballSpeed.x;
    let newY = ballPosition.y + ballSpeed.y;
  
    // Проверка на столкновение с левым и правым краем экрана
    if (newX <= 0 || newX >= screenWidth) {
      setBallSpeed(prev => ({ ...prev, x: -prev.x })); // Меняем направление по оси X
      newX = newX <= 0 ? 0 : screenWidth; // Устанавливаем мяч на границу
    }
  

    // Для счёта
    // Проверка на столкновение с верхним и нижним краем экрана
    if (newY <= 0 || newY >= screenHeight) {
      setBallSpeed(prev => ({ ...prev, y: -prev.y })); // Меняем направление по оси Y
      newY = newY <= 0 ? 0 : screenHeight; // Устанавливаем мяч на границу
    }
  
    setBallPosition({ x: newX, y: newY });
  
    // Отправляем обновленную позицию мяча на сервер
    if (gameId) {
      socket.emit('ballMove', { game_id: gameId, x: newX, y: newY });
    }
  };
  
  useEffect(() => {
    if (playerNumber !== 2) {  // Позицию мяча отправляет только хост
      const interval = setInterval(moveBall, 5);
      return () => clearInterval(interval);
    }
  }, [ballPosition]);

  return (
    <View style={styles.container}>
      {isWaiting ? (
        <Text style={styles.waitingText}>Ожидание второго игрока...</Text>
      ) : (
        <>
          <View
            style={[styles.paddle, { left: playerPosition.x, top: playerPosition.y }]}
            {...panResponder.panHandlers}
          />
          <View style={[styles.paddle, { left: opponentPosition.x, top: opponentPosition.y }]} />
          <View style={[styles.ball, { left: ballPosition.x, top: ballPosition.y }]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    color: 'white',
    fontSize: 24,
  },
  paddle: {
    position: 'absolute',
    width: 100,
    height: 20,
    backgroundColor: 'white',
  },
  ball: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: 'red',
    borderRadius: 10,
  },
});
