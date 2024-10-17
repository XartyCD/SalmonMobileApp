import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, TextInput, Text, View, Pressable, Image, Alert, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import ShopPopup from './ShopPopup.js';

import { Audio } from 'expo-av';
import { useAppContext } from '../context/context.js';


export default function HomePage( { navigation } ) {
  const { checkInfoApp, checkedVersion, checkInternetConnection, CONNECTURL } = useAppContext();

  const [isDataLoaded, setIsDataLoaded] = useState(false);


  const [showShop, setShowShop] = useState(false);


  const { user, setUser } = useAppContext();
  const [balance, setBalance] = useState(0);
  const balanceRef = useRef(balance);
  const [countTap, setcountTap] = useState(0);
  const [priceUpgradeTap, setpriceUpgradeTap] = useState(0);
  const upgradeTapPrices = [60, 250, 550, 1300, 2900, 4800, 7000, 12500, 17000, 38000, 65000, 95000, 180000, 330000, 490000, 880000, 2000000, 5000000, 10000000]
  const countTapList = [1, 2, 3, 6, 8, 11, 13, 15, 16, 20, 25, 30, 40, 50, 70, 90, 130, 220, 404]

  const [sound, setSound] = useState();

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  
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
  
  // Загрузить данные при старте приложения (срабатывает ТОЛЬКО при первом ренддере, (переключение вкладок не перерендеривает))
  const loadAppData = async () => {
    try {
      // Загружаем данные из AsyncStorage
      const savedBalance = await loadData('balance');
      const countTap = await loadData('countTap');
      const priceUpgradeTap = await loadData('priceUpgradeTap');
  
      // Устанавливаем состояние, если данные найдены
      if (savedBalance) setBalance(savedBalance);
      if (countTap) setcountTap(countTap);
      if (priceUpgradeTap) setpriceUpgradeTap(priceUpgradeTap);
  
      // Возвращаем true, если все данные успешно загружены
      return true;
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      // Возвращаем false, если произошла ошибка
      return false;
    }
  };

// Первичный запуск всего важного

useEffect(() => {
  const initializeApp = async () => {
    const result = await loadAppData();
    const connected = await checkInternetConnection();
    if (result && connected) {
      setIsDataLoaded(true);
      postYourRating()
    }
    console.log('Загрузка прогресса прошла:', result ? 'успешно' : 'с ошибкой', );
  };

  initializeApp(); // Запускаем асинхронную инициализацию

}, []);


  // Сохранение данных при изменении состояния
  useEffect(() => {
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
        // Удаляем данные из AsyncStorage
        await AsyncStorage.clear()
        
        // Сбрасываем состояния
        setUser(null);
        setBalance(0);
        setcountTap(0);
        setpriceUpgradeTap(0);

        alert('Прогресс успешно сброшен!');
      } else {
        alert('Ошибка при сбросе!');
      }
      
    } catch (e) {
      console.error('Ошибка сброса прогресса', e);
    }
  };

  const confirmResetProgress = async () => {
    const connected = await checkInternetConnection();
    if (connected) {
      Alert.alert(
        "Сбросить прогресс?", // Заголовок
        `Вы уверены, что хотите сбросить прогресс лосося ${user}?`, // Сообщение
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
    } else {
      alert("Нет подключения к интернету!");
    }
  };


  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/audio/clickVar1.mp3') // путь к вашему звуковому файлу
    );
    setSound(sound);
    await sound.playAsync();
  }

  // Освобождение ресурсов при размонтировании компонента
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);


  const changeCurrency = () => {
    alert("Пока что лосоcь один")
  }

  const settingsMenu = () => {
    alert("Настройки еще недоступны")
  }


  const onPressLearnMore = () => {
    tapUpBalance(countTapList[countTap])
    playSound()
  }

  const showerShop = () => {
    setShowShop(!showShop)
  }

  const openRating = async () => {
    const connected = await checkInternetConnection();
    if (connected) {
      navigation.navigate('RatingScreen');
    } else {
      alert("Нет подключения к интернету!");
    }
  };

  const openChat = async () => {
    const connected = await checkInternetConnection();
    if (connected) {
      navigation.navigate('ChatScreen');
    } else {
      alert("Нет подключения к интернету!");
    }
  };
  
  const openBattle = async () => {
    const connected = await checkInternetConnection();
    if (connected) {
      navigation.navigate('LobbyPongScreen');
    } else {
      alert("Нет подключения к интернету!");
    }
  };

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


  const postYourRating = async () => {
    console.log("Отправка...")
    const connected = await checkInternetConnection();
    if (connected) {
      try {
        const response = await fetch(`${CONNECTURL}/postyourrating`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user, balance: balanceRef.current }),
        });
  
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        } else {
          console.log(`Личный рейтинг отправлен ${balanceRef.current}`);
        }
    
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
      }
    } else {
      console.log(`Нет интернета ${balanceRef.current}`)
    }
  }

  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isDataLoaded) {
        postYourRating()
      }
    });
    

    // Перед отправкой сделать проверку на версию!!!!!!!!!!!!!!!!!

    const intervalId = setInterval(postYourRating, 60000); // Проверка каждые 60 секунд
  
    // Очистка при размонтировании компонента и удалении слушателя
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [navigation, balance]);

  return (
    <View>
    {showShop && <ShopPopup onClose={showerShop}/>}
    

    <ScrollView style={styles.mainWrapper}>
      <View>

        {/* Технический Top блок */}
        <View style={styles.userBlock}>
          <View style={styles.userInfo}>
            <Text style={styles.yourSalmonText}>Твой Лосось</Text>
              <ScrollView style={styles.scrollUsername} horizontal showsHorizontalScrollIndicator={false}
               contentContainerStyle={styles.scrollUsernameContentContainer}>
                <View style={styles.wrapperUsername}>
                  <Text style={styles.userName}>{user}</Text>
                </View>
              </ScrollView>
          </View>

          <View style={styles.changeSalmon}>
            <LinearGradient
              colors={['rgb(1, 110, 218)', 'rgb(217, 0, 192)']}  // Градиентные цвета
              start={[0, 0]} 
              end={[1, 1]}
              style={styles.btnGradientBorder}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  pressed && styles.btnPressed,  // Эффект при нажатии
                ]}
                onPress={() => console.log('Button Pressed')}
              >
                <Text style={styles.btnText}>Сменить валюту</Text>
              </Pressable>
            </LinearGradient>
          </View>
          <View style={styles.settingsMenu}>
            <Pressable
              style={styles.settingsMenuButton}
              onPress={settingsMenu}
              ><Text style={styles.settingsMenuText}>Меню</Text>
            </Pressable>
            </View>
        </View>

        {/* Операционные кнопки */}

        <View style={styles.header}>

          <View style={styles.profit_tap}>
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

          <View style={styles.exchange}>
            <Pressable
              style={styles.exchange_button}
              onPress={upgradeClick}
              >
                <Text style={styles.title}>Обменник</Text>
                <Image
                source={require('../assets/images/exchange.png')}
                style={{
                  width: 30,
                  height: 30,
                }}
                resizeMode="cover"
              />
            </Pressable>
          </View>

        </View>

      </View>

      {/*    Тар зона       */}
      <View style={styles.container}>

        <Text style={styles.title}>Прибыль за тап: {countTapList[countTap]}</Text>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? '#d1d1d1' : '#841584', // Меняем цвет при нажатии
              transform: [{ scale: pressed ? 0.94 : 1 }] // Немного уменьшаем кнопку при нажатии
            },
            styles.mainButtonStyle
          ]}
          onPress={onPressLearnMore}
          ><Image style={{
            width: '100%',
            height: "100%"
          }}
            source={require('../assets/images/trout.gif')}
            resizeMode="contain"
          />
        </Pressable>

        <Text style={styles.balanceTitle}>Баланс:</Text>
        <Text style={styles.balanceTitle}>{balance} BBCoin</Text>



        <Pressable
            style={styles.shopButton}
            onPress={showerShop}
            >
              <Text style={{
                fontSize: 23,

              }}>Shop</Text>
              <Image
              source={require('../assets/images/shopIcon.png')}
              style={{
                width: 30,
                height: 30,
              }}
              resizeMode="cover"
            />
        </Pressable>

        <View style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
        }}>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? 'red' : '#841584', // Меняем цвет при нажатии
                transform: [{ scale: pressed ? 0.99 : 1 }] // Немного уменьшаем кнопку при нажатии
              },
              styles.topButton
            ]}
            onPress={openRating}
            ><Image
              source={require('../assets/images/top.png')}
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
              styles.chatButton
            ]}
            onPress={openChat}
            ><Image
              source={require('../assets/images/chatIco.png')}
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
              styles.battleButton
            ]}
            onPress={openBattle}
            ><Image
              source={require('../assets/images/battleIcon.png')}
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
    </View>
  )
}

const styles = StyleSheet.create({
  // Главные тап кнопки
  mainWrapper: {
    marginTop: 49,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: "row",
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: "space-around",
    marginTop: 25,
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
  exchange: {
    borderColor: 'black',   // Цвет рамки
    borderStyle: 'solid', // Тип рамки
    borderRadius: 8,
  },
  exchange_button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6, 
    borderColor: 'black',   // Цвет рамки
    borderStyle: 'dashed', // Тип рамки
    borderWidth: 1.5,            // Толщина рамки (добавьте, если рамка не отображается)
    borderRadius: 8,
  },
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 100,
  },

  userBlock: {
    backgroundColor: "#b0b0b0db",
    color: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 4,
    width: "100%"
  },
  userInfo: {
    width: 104,
    maxWidth: 104,
    height: "auto",
    maxHeight: 50,
  },

  yourSalmonText: {
    fontSize: 11,
    textAlign: "center"
  },

  scrollUsername: {
    borderTopWidth: 2,       // Толщина рамки
    borderTopColor: '#545454db',   // Цвет рамки
    borderStyle: 'solid', // Тип рамки
    borderTopLeftRadius:8,
    borderTopRightRadius: 8,
    paddingHorizontal: 3,
    marginTop: 5,
  },


  scrollUsernameContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',    // Центрирование содержимого
    alignItems: 'center',
  },

  userName: {
    padding: 4,
    fontSize: 15,
    color: "white",
    flexWrap: 'wrap',
  },



  changeSalmon: {
    width: 111,
    padding: 5,
  },

  btnGradientBorder: {
    padding: 2.2,  // Отступ для градиентной рамки
    borderRadius: 10,  // Радиус для закругления углов рамки
  },
  btn: {
    backgroundColor: '#141414dd',  // Черный фон кнопки
    paddingVertical: 5,
    paddingHorizontal: 0,
    borderRadius: 8,  // Радиус для закругления углов самой кнопки
  },
  btnText: {
    fontSize: 15,
    color: '#fff',  // Белый цвет текста
    textAlign: 'center',
  },
  btnPressed: {
    backgroundColor: '#333',  // Темнее при нажатии
  },


  settingsMenu: {
    width: 104,
    alignItems: "flex-end"
  },

  settingsMenuButton: {
    borderRadius: 3,
    width: 80,
    backgroundColor: "#030303",
    paddingVertical: 7
  },

  settingsMenuText: {
    textAlign: "center",
    color: "white"
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
    padding: 5,
    height: 172,
    width: '80%',
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c7c7c7d2",
    borderRadius: 100,
  }, 
  mainTextButtonStyle: {
    color: 'white',
    fontSize: 18,
  },
  // Главные тап кнопки
  // Серверные кнопки

  shopButton: {
    flexDirection: "row",
    paddingHorizontal: 68,
    paddingVertical: 12,
    backgroundColor: "#ded94be3",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 17,
    marginTop: 60, 
    gap: 20,
    marginBottom: 20,

    borderColor: 'black',   // Цвет рамки
    borderStyle: 'dotted', // Тип рамки
    borderWidth: 1.2, // Толщина рамки (добавьте, если рамка не отображается)
    borderRadius: 8,
  },
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
  battleButton: {
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
    marginTop: 200,
    marginBottom: 30,
  },

});
