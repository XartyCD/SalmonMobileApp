import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, TextInput, Text, View, Pressable, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { Audio } from 'expo-av';
import { useAppContext } from '../context/context.js';

const CONNECTURL = "37.139.62.40"

export default function HomePage() {
  const { user, setUser } = useAppContext();
  const [balance, setBalance] = useState(0);
  const [countTap, setcountTap] = useState(0);
  const [priceUpgradeTap, setpriceUpgradeTap] = useState(0);
  const upgradeTapPrices = [50, 200, 450, 800, 1200, 2500, 5000, 8000, 15000, 30000, 60000, 85000, 150000, 300000, 450000, 780000, 2000000, 5000000, 10000000]
  const countTapList = [1, 2, 3, 6, 8, 11, 13, 15, 16, 20, 25, 30, 40, 50, 80, 100, 150, 250, 500]

  const [sound, setSound] = useState();


  const saveData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Обработка ошибок при сохранении данных
      console.error("Failed to save data", e);
    }
  };


  const loadData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (e) {
      // Обработка ошибок при загрузке данных
      console.error("Failed to load data", e);
    }
    return null;
  };
  
  // Загрузить данные при старте приложения
  React.useEffect(() => {
    loadData('balance').then(savedBalance => {
      if (savedBalance) setBalance(savedBalance);
    });

    loadData('countTap').then(countTap => {
      if (countTap) setcountTap(countTap);
    });

    loadData('priceUpgradeTap').then(priceUpgradeTap => {
      if (priceUpgradeTap) setpriceUpgradeTap(priceUpgradeTap);
    });
  }, []);

  // Сохранение данных при изменении состояния
  React.useEffect(() => {
    if (user !== null) {
      saveData('user', user)};
      saveData('balance', balance)
      saveData('countTap', countTap)
      saveData('priceUpgradeTap', priceUpgradeTap)
  }, [user, balance, countTap, priceUpgradeTap]);






  const resetProgress = async () => {
    try {
      const response = await fetch(`${CONNECTURL}/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      });

      const data = await response.json()
      if (data.success) {
        alert('Прогресс успешно сброшен!');
      } else {
        alert('Ошибка при сбросе!');
      }
      // Удаляем данные из AsyncStorage
      await AsyncStorage.clear()
      
      // Сбрасываем состояния
      setUser(null);
      setBalance(0);
      setcountTap(0);
      setpriceUpgradeTap(0);
      
    } catch (e) {
      console.error('Ошибка сброса прогресса', e);
    }
  };

  const confirmResetProgress = () => {
    Alert.alert(
      "Подтверждение удаления", // Заголовок
      "Вы уверены, что хотите удалить профиль?", // Сообщение
      [
        {
          text: "Отмена", // Текст кнопки отмены
          style: "cancel", // Стиль кнопки (cancel делает текст жирным)
        },
        {
          text: "Конечно", // Текст кнопки удаления
          onPress: resetProgress, // Действие при подтверждении (вызываем функцию сброса)
          style: "destructive", // Стиль для кнопки удаления (подсветит её красным)
        },
      ],
      { cancelable: true } // Позволяет закрывать меню нажатием вне области
    );
  };




  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require('../audio/clickVar1.mp3') // путь к вашему звуковому файлу
    );
    setSound(sound);
    await sound.playAsync();
  }

  // Освобождение ресурсов при размонтировании компонента
  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);


  const onPressLearnMore = () => {
    tapUpBalance(countTapList[countTap])
    playSound()
  }

  const openChat = () => {
    alert("Да")
  }
  
  const tapUpBalance = (num) => {
    setBalance(balance+num);
  };

  const upgradeClick = () => {
    if ( balance >= upgradeTapPrices[priceUpgradeTap] ) {
      setpriceUpgradeTap(priceUpgradeTap + 1)
      setcountTap(countTap + 1)
      setBalance(balance-upgradeTapPrices[priceUpgradeTap])
      alert("Апгрейд прошел успешно!")
    }
    else {
      alert("Недостаточно средств")
    }
  }

  const godmode = () => {
    setBalance(balance+200)
  }

  return (
    <ScrollView style={styles.mainWrapper}>
      <View>
        <View style={styles.header}>

          <Text style={styles.title}>Прибыль за тап: {countTapList[countTap]}</Text>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? '#d1d1d1' : '#841584', // Меняется цвет при нажатии
              },
              styles.upgradeButtonStyle,
            ]}
            onPress={upgradeClick}
            ><Text style={styles.upgradeTextButtonStyle}>Прокачать Тап за {upgradeTapPrices[priceUpgradeTap]} </Text>
          </Pressable>
        </View>
        <View style={styles.userBlock}>
          <Text style={styles.userName}>{user}</Text>
        </View>
      </View>
          {/*           */}
      <View style={styles.container}>

        <Text style={styles.title}>Твой Лосось</Text>

        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? '#d1d1d1' : '#841584', // Меняем цвет при нажатии
              transform: [{ scale: pressed ? 0.94 : 1 }] // Немного уменьшаем кнопку при нажатии
            },
            styles.mainButtonStyle
          ]}
          onPress={onPressLearnMore}
          ><Image
            source={require('../images/trout.gif')}
            resizeMode="contain"
          />
        </Pressable>

        <Text style={styles.balanceTitle}>Баланс:</Text>
        <Text style={styles.balanceTitle}>{balance} BBCoin</Text>

        <View style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          marginTop: 70
        }}>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? 'red' : '#841584', // Меняем цвет при нажатии
                transform: [{ scale: pressed ? 0.99 : 1 }] // Немного уменьшаем кнопку при нажатии
              },
              styles.chatButton
            ]}
            onPress={openChat}
            ><Image
              source={require('../images/chatIco.png')}
              style={{
                width: 50,
                height: 50,
              }}
              resizeMode="cover"
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? 'red' : '#841584', // Меняем цвет при нажатии
                transform: [{ scale: pressed ? 0.99 : 1 }] // Немного уменьшаем кнопку при нажатии
              },
              styles.topButton
            ]}
            onPress={onPressLearnMore}
            ><Image
              source={require('../images/top.png')}
              style={{
                width: 50,
                height: 50,
              }}
              resizeMode="cover"
            />
          </Pressable>
        </View>
        <Pressable
          style={styles.resetButton}

          onPress={confirmResetProgress}
        >
          <Text style={styles.resetText}>Сбросить прогресс</Text>
        </Pressable>
        <Pressable
          onPress={godmode}
        >
          <Text style={styles.resetText}>Читы</Text>
        </Pressable>
        
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  warnSetNickname: {
    padding: 4,
    backgroundColor: "#ff4f4fdb",
    color: "white",
    fontSize: 16,
  },

  // Главные тап кнопки
  mainWrapper: {
    marginTop: 50,
    paddingHorizontal: 4,
    marginBottom: 20, 
  },
  header: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonStyle: {
    padding: 15,
    backgroundColor: "purple",
    borderRadius: 5,
  }, 
  upgradeTextButtonStyle: {
    color: 'white',
    fontSize: 15,
  },
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 100,
  },
  userBlock: {
    backgroundColor: "#7d19e0db",
    color: "white",
    borderRadius: 50,
    
  },
  userName: {
    fontSize: 22,
    padding: 5,
    backgroundColor: "#000",
    color: "white",
  },
  title: {
    color: "red",
    fontSize: 20
  },
  balanceTitle: {
    color: "blue",
    fontSize: 30
  },
  mainButtonStyle: {
    padding: 60,
    backgroundColor: "#c7c7c7d2",
    borderRadius: 70,
  }, 
  mainTextButtonStyle: {
    color: 'white',
    fontSize: 18,
  },
  // Главные тап кнопки
  // Серверные кнопки
  chatButton: {
    padding: 10,
    backgroundColor: "#c7c7c7d2",
    borderRadius: 30,
  },
  topButton: {
    padding: 10,
    backgroundColor: "#c7c7c7d2",
    borderRadius: 30,
  },
  // Серверные кнопки 

  resetText: {
    padding: 6,
    backgroundColor: "#db710ddb",
    color: "black",
    fontSize: 20,
    marginTop: 200
  },

});
