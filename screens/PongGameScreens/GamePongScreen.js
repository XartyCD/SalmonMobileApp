import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, Dimensions, PanResponder, Button } from 'react-native';
import io from 'socket.io-client';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const socket = Platform.OS === 'ios' ? io("http://localhost:9000") : io("http://10.0.2.2:9000");

export default function GamePongScreen({ route }) {
  const { playerName } = route.params;  // Имя игрока, переданное из предыдущего экрана
  const [gameId, setGameId] = useState(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [playerPosition, setPlayerPosition] = useState({ x: screenWidth / 2, y: screenHeight - 50 });
  const [opponentPosition, setOpponentPosition] = useState({ x: screenWidth / 2, y: 50 });
  const [ballPosition, setBallPosition] = useState({ x: screenWidth / 2, y: screenHeight / 2 });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => !isWaiting,  // Не позволяем двигаться, если игрок ждет
    onPanResponderMove: (e, gestureState) => {
      const newPos = { x: gestureState.moveX - 50, y: playerPosition.y };
      setPlayerPosition(newPos);
      if (gameId) {
        socket.emit('playerMove', { gameId, position: newPos });
      }
    },
  });

  useEffect(() => {
    // Создание нового пула игры
    socket.emit('createGame', playerName);
    socket.on('waitingForPlayer', (id) => {
      setGameId(id);
      setIsWaiting(true);
    });

    // Когда второй игрок присоединяется, игра начинается
    socket.on('startGame', (game) => {
      setIsWaiting(false);  // Ожидание завершено
    });

    // Обновляем позиции игроков и мяча
    socket.on('updateGame', (players) => {
      const opponent = Object.values(players).find((player) => player.position.y === 50);
      if (opponent) {
        setOpponentPosition(opponent.position);
      }
    });

    socket.on('updateBall', (ballData) => {
      setBallPosition(ballData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const moveBall = () => {
    let newX = ballPosition.x + 2;
    let newY = ballPosition.y + 2;

    if (newX < 0 || newX > screenWidth) newX = ballPosition.x * -1;
    if (newY < 0 || newY > screenHeight) newY = ballPosition.y * -1;

    setBallPosition({ x: newX, y: newY });
    if (gameId) {
      socket.emit('ballMove', { gameId, x: newX, y: newY });
    }
  };

  useEffect(() => {
    const interval = setInterval(moveBall, 50);
    return () => clearInterval(interval);
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
};

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
