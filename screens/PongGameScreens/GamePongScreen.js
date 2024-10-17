import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import io from 'socket.io-client';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Подключение к WebSocket
const socket = Platform.OS === 'ios' ? io('http://localhost:9003') : io('http://10.0.2.2:9003')

export default function GamePongScreen({ game_id, playerName }) {
  const [gameId, setGameId] = useState(game_id || null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [playerPosition, setPlayerPosition] = useState({ x: screenWidth / 2, y: screenHeight - 50 });
  const [opponentPosition, setOpponentPosition] = useState({ x: screenWidth / 2, y: 50 });
  const [ballPosition, setBallPosition] = useState({ x: screenWidth / 2, y: screenHeight / 2 });

  // Управление движением игрока
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => !isWaiting,
    onPanResponderMove: (e, gestureState) => {
      const newPos = { x: gestureState.moveX - 50, y: playerPosition.y };
      setPlayerPosition(newPos);
      if (gameId) {
        socket.emit('playerMove', { gameId, position: newPos });
      }
    },
  });

  useEffect(() => {
    // Если игра уже создана, присоединяемся, иначе создаем новую игру
    if (game_id) {
      socket.emit('joinGame', game_id, playerName);
    } else {
      socket.emit('createGame', playerName);
    }

    // Ожидание второго игрока
    socket.on('waitingForPlayer', (id) => {
      setGameId(id);
      setIsWaiting(true);
    });

    // Старт игры при присоединении второго игрока
    socket.on('startGame', () => {
      setIsWaiting(false);
    });

    // Обновление позиций игроков
    socket.on('updateGame', (players) => {
      const opponent = Object.values(players).find((player) => player.position.y === 50);
      if (opponent) {
        setOpponentPosition(opponent.position);
      }
    });

    // Обновление позиции мяча
    socket.on('updateBall', (ballData) => {
      setBallPosition(ballData);
    });

    // Очистка соединения при выходе
    return () => {
      socket.disconnect();
    };
  }, []);

  // Функция для передвижения мяча
  const moveBall = () => {
    let newX = ballPosition.x + 4;
    let newY = ballPosition.y + 4;

    if (newX < 0 || newX > screenWidth) newX = ballPosition.x * -1;
    if (newY < 0 || newY > screenHeight) newY = ballPosition.y * -1;

    setBallPosition({ x: newX, y: newY });
    if (gameId) {
      socket.emit('ballMove', { gameId, x: newX, y: newY });
    }
  };

  useEffect(() => {
    const interval = setInterval(moveBall, 8);
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
