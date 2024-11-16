import AsyncStorage from "@react-native-async-storage/async-storage"
import { StatusBar } from "expo-status-bar"
import {
  AppState,
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  View,
  Pressable,
  Image,
  Alert,
  Animated,
} from "react-native"
import React, { useState, useEffect, useRef } from "react"
import { LinearGradient } from "expo-linear-gradient"
import ShopPopup from "./ShopPopup.js"

import { Audio } from "expo-av"
import { useAppContext } from "../context/context.js"

export default function HomePage({ navigation }) {
  const appState = useRef(AppState.currentState);

  const { sessionId, setSessionId, checkInfoApp, checkInternetConnection, CONNECTURL } =
    useAppContext()

  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const [showShop, setShowShop] = useState(false)

  const { user, setUser } = useAppContext()
  const [balance, setBalance] = useState(0)
  const balanceRef = useRef(balance)
  const [countTap, setcountTap] = useState(0)
  const countTapRef = useRef(countTap)

  const upgradeTapPrices = [
    60, 250, 550, 1300, 2900, 4800, 7000, 12500, 17000, 38000, 65000, 95000,
    180000, 330000, 490000, 880000, 2000000, 5000000, 10000000,
  ]
  const countTapList = [
    1, 2, 3, 6, 8, 11, 13, 15, 16, 20, 25, 30, 40, 50, 70, 90, 130, 220, 404,
  ]

  const [sound, setSound] = useState()

  useEffect(() => {
    balanceRef.current = balance
  }, [balance])

  useEffect(() => {
    countTapRef.current = countTap
  }, [countTap])



  // Вывод AsyncStorage в консоль (для отладки)
  async function getAllDataFromAsyncStorage() {
    try {
      // Получаем все ключи
      const keys = await AsyncStorage.getAllKeys();

      // Получаем все пары ключ-значение
      const result = await AsyncStorage.multiGet(keys);

      // Преобразуем результат в объект для удобства использования
      const allData = result.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

      console.log("Все данные из AsyncStorage:", allData);
      return allData;
    } catch (error) {
      console.error("Ошибка при получении данных из AsyncStorage:", error);
    }
  }



  // Функция на сохранение данных
  const saveData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      // Обработка ошибок при сохранении данных
      console.error("Failed to save data", e)
    }
  }

  // Функция на загрузку данных
  const loadData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key)
      if (value !== null) {
        return JSON.parse(value)
      }
    } catch (e) {
      // Обработка ошибок при загрузке данных
      console.error("Failed to load data", e)
    }
    return null
  }

  //Загрузка данных из локалки при первом рендере
  const loadDataInAsyncStorage = async () => {
    try {
      // Загружаем данные из AsyncStorage
      const savedBalance = await loadData("balance");
      const countTap = await loadData("countTap");

      // Устанавливаем состояние, если данные найдены
      if (savedBalance) setBalance(savedBalance);
      if (countTap) setcountTap(countTap);

      // Возвращаем true, если все данные успешно загружены
      return true;

    } catch (error) {

      console.error("Ошибка при загрузке данных:", error)
      return false
    }
  }


  // Загрузить данные при старте приложения (срабатывает ТОЛЬКО при первом ренддере, (переключение вкладок не перерендеривает))
  const loadAppData = async () => {
    let loadFromBase = false

    try { // Проверка на то, загружены ли актуальные данные с базы (при успешной АВТОРИЗАЦИИ в аккаунт)
      loadFromBase = await loadData("loadfrombase")
    } catch (error) {
      console.error("Ошибка при проверке загруженности данных:", error)
    }

    console.log(loadFromBase, "Загрузка данных")
    if (loadFromBase) {

      const result = await loadDataInAsyncStorage()
      await postYourRating()

      return result

      // Загрузка данных с бд при авторизации в аккаунт
    } else {
      const loadDataFromBase = async () => {
        try {
          const response = await fetch(`${CONNECTURL}/firstdataload`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user }),
          });

          const data = await response.json();
          console.log("Данные с сервера при заходе", data.date)
          if (data.success) {

            console.log("первичный сейв в сторэдж")

            saveData("balance", Number(data.date[0].balance))
            saveData("countTap", Number(data.date[0].countTap))

            // почему то на серв опять высылается 0 в балансе, починить
            const loaded = true
            saveData("loadfrombase", loaded)
            await getAllDataFromAsyncStorage()


            const result = await loadDataInAsyncStorage()
            console.log("Итог лоада", result)
            return result
          }

        } catch (error) {
          console.error('Ошибка при получении данных:', error);
          return false
        }
      }

      return loadDataFromBase()
    }

  }

  // Первичный запуск всего важного (подгрузка данных из сторэджа/из бд, авторизация)
  useEffect(() => {
    const initializeApp = async () => {
      console.log("Инициализация из Home...")
      const connected = await checkInternetConnection(false, true) // проверка инета (+ проверка в контексте)
      const result = await loadAppData() // ожидание подгрузки данных
      if (result && connected) {
        setIsDataLoaded(true)
      }
      console.log(
        "Первичная инициализация завершена",
        result ? "успешно" : "с ошибкой"
      )
    }

    initializeApp() // Запускаем асинхронную инициализацию
  }, [])

  // Сохранение данных при изменении состояния
  useEffect(() => {
    if (user !== null) {
      saveData("user", user)
    }
    if (sessionId !== null) {
      saveData("sessionId", sessionId)
      console.log("запись в сторедж")
    }
    if (isDataLoaded) {   // чтобы небыло отправки нулевых данных когда верные данные не успели подгрузиться
      saveData("balance", balance)
      saveData("countTap", countTap)

    }

  }, [user, sessionId, balance, countTap])




  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      // Проверяем, если приложение переходит в фоновый режим
      if (appState.current === 'active' && (nextAppState === 'inactive' || nextAppState === 'background')) {
        console.log('Приложение ушло в фоновый режим или неактивное состояние');
        postYourRating()
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);






  const leaveAccount = async () => {
    const connected = await checkInternetConnection(true)
    if (connected) {
      try {
        const response = await fetch(`${CONNECTURL}/leave-account`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user, balance, countTap }),
        })

        const data = await response.json()
        if (data.success) {

          // Сбрасываем состояния
          setUser(null)
          setSessionId(null)
          setBalance(0)
          setcountTap(0)

          // Удаляем данные из AsyncStorage
          await AsyncStorage.clear()

          alert("Вы успешно вышли!")
        } else {
          alert("Ошибка выхода!")
        }
      } catch (e) {
        console.error("Ошибка выхода", e)
      }
    } else {
      alert("Нет подключения к интернету!")
    }
  }

  const resetProgress = async () => {
    try {
      const response = await fetch(`${CONNECTURL}/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      })

      const data = await response.json()
      if (data.success) {
        // Удаляем данные из AsyncStorage
        await AsyncStorage.clear()

        // Сбрасываем состояния
        setUser(null)
        setBalance(0)
        setcountTap(0)

        alert("Прогресс успешно сброшен!")
      } else {
        alert("Ошибка при сбросе!")
      }
    } catch (e) {
      console.error("Ошибка сброса прогресса", e)
    }
  }

  const confirmResetProgress = async () => {
    const connected = await checkInternetConnection(true, true)
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
      )
    } else {
      alert("Нет подключения к интернету!")
    }
  }

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/audio/clickVar1.mp3") // путь к вашему звуковому файлу
    )
    setSound(sound)
    await sound.playAsync()
  }

  // Освобождение ресурсов при размонтировании компонента
  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync()
      }
      : undefined
  }, [sound])

  const changeCurrency = () => {
    alert("Пока что лосоcь один")
  }

  const settingsMenu = () => {
    alert("Настройки еще недоступны")
  }

  const tapMainButton = () => {
    tapUpBalance(countTapList[countTap])
    playSound()
  }

  const showerShop = () => {
    setShowShop(!showShop)
  }

  const openRating = async () => {
    const connected = await checkInternetConnection(true, true)
    if (connected) {
      navigation.navigate("RatingScreen")
    } else {
      alert("Нет подключения к интернету!")
    }
  }

  const openChat = async () => {
    const connected = await checkInternetConnection(true, true)
    if (connected) {
      navigation.navigate("ChatScreen")
    } else {
      alert("Нет подключения к интернету!")
    }
  }

  const openBattle = async () => {
    const connected = await checkInternetConnection(true, true)
    if (connected) {
      navigation.navigate("LobbyPongScreen")
    } else {
      alert("Нет подключения к интернету!")
    }
  }

  const tapUpBalance = (num) => {
    setBalance(balance + num)
  }

  const upgradeClick = () => {
    if (balance >= upgradeTapPrices[countTap]) {

      setcountTap(countTap + 1)
      setBalance(balance - upgradeTapPrices[countTap])
      alert("Апгрейд прошел успешно!")
    } else {
      alert("Недостаточно средств")
    }
  }

  const godmode = () => {
    setBalance(balance + 200)
  }

  // Дублирование вызова функций из-за того что проверка инета и версии происходит при первом рендере, 
  // а затем при дальнейшем взаимодействии с приложением
  const postYourRating = async () => {
    console.log("Отправка прогресса в бд...")
    const connected = await checkInternetConnection(true, true)
    console.log(connected)
    if (connected) {
      try {
        const response = await fetch(`${CONNECTURL}/postyourrating`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user, balance: balanceRef.current, countTap: countTapRef.current }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message)
        } else {
          console.log(`Личный рейтинг отправлен ${balanceRef.current} ${countTapRef.current}`)
        }
      } catch (error) {
        console.error("Ошибка при отправке рейтинга:", error)
      }
    } else {
      console.log(`Нет интернета для отправки данных на сервер`)
    }
  }


  // действия при фокусировке на HomePage (при каждом открытии этого экрана)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (isDataLoaded) {
        postYourRating()
      }
    })

    // Проверка версии и инета происходит в самой функции отправки

    // const intervalId = setInterval(postYourRating, 60000) // Проверка каждые 60 секунд

    // Очистка при размонтировании компонента и удалении слушателя
    return () => {
      // clearInterval(intervalId)
      unsubscribe()
    }
  }, [navigation, balance])

  return (
    <View>
      {showShop && <ShopPopup onClose={showerShop} />}

      <ScrollView style={styles.mainWrapper}>
        <View>
          {/* Технический Top блок */}
          <View style={styles.userBlock}>
            <View style={styles.userInfo}>
              <Text style={styles.yourSalmonText}>Твой Лосось</Text>
              <ScrollView
                style={styles.scrollUsername}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollUsernameContentContainer}
              >
                <View style={styles.wrapperUsername}>
                  <Text style={styles.userName}>{user}</Text>
                </View>
              </ScrollView>
            </View>

            <View style={styles.changeSalmon}>
              <LinearGradient
                colors={["rgb(1, 110, 218)", "rgb(217, 0, 192)"]} // Градиентные цвета
                start={[0, 0]}
                end={[1, 1]}
                style={styles.btnGradientBorder}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    pressed && styles.btnPressed, // Эффект при нажатии
                  ]}
                  onPress={() => console.log("Button Pressed")}
                >
                  <Text style={styles.btnText}>Сменить валюту</Text>
                </Pressable>
              </LinearGradient>
            </View>
            <View style={styles.settingsMenu}>
              <Pressable
                style={styles.settingsMenuButton}
                onPress={settingsMenu}
              >
                <Text style={styles.settingsMenuText}>Меню</Text>
              </Pressable>
            </View>
          </View>

          {/* Операционные кнопки */}

          <View style={styles.header}>
            <View style={styles.profit_tap}>
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "#d1d1d1" : "#841584", // Меняется цвет при нажатии
                  },
                  styles.upgradeButtonStyle,
                ]}
                onPress={upgradeClick}
              >
                <Text style={styles.upgradeTextButtonStyle}>
                  Прокачать Тап за {upgradeTapPrices[countTap]}{" "}
                </Text>
              </Pressable>
            </View>

            <View style={styles.exchange}>
              <Pressable style={styles.exchange_button} onPress={upgradeClick}>
                <Text style={styles.title}>Обменник</Text>
                <Image
                  source={require("../assets/images/exchange.png")}
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
          <Text style={styles.title}>
            Прибыль за тап: {countTapList[countTap]}
          </Text>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#d1d1d1" : "#841584", // Меняем цвет при нажатии
                transform: [{ scale: pressed ? 0.94 : 1 }], // Немного уменьшаем кнопку при нажатии
              },
              styles.mainButtonStyle,
            ]}
            onPress={tapMainButton}
          >
            <Image
              style={{
                width: "100%",
                height: "100%",
              }}
              source={require("../assets/images/trout.gif")}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={styles.balanceTitle}>Баланс:</Text>
          <Text style={styles.balanceTitle}>{balance} BBCoin</Text>

          <Pressable style={styles.shopButton} onPress={showerShop}>
            <Text
              style={{
                fontSize: 23,
              }}
            >
              Shop
            </Text>
            <Image
              source={require("../assets/images/shopIcon.png")}
              style={{
                width: 30,
                height: 30,
              }}
              resizeMode="cover"
            />
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? "red" : "#841584", // Меняем цвет при нажатии
                  transform: [{ scale: pressed ? 0.99 : 1 }], // Немного уменьшаем кнопку при нажатии
                },
                styles.topButton,
              ]}
              onPress={openRating}
            >
              <Image
                source={require("../assets/images/top.png")}
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
                  backgroundColor: pressed ? "red" : "#841584", // Меняем цвет при нажатии
                  transform: [{ scale: pressed ? 0.99 : 1 }], // Немного уменьшаем кнопку при нажатии
                },
                styles.chatButton,
              ]}
              onPress={openChat}
            >
              <Image
                source={require("../assets/images/chatIco.png")}
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
                  backgroundColor: pressed ? "red" : "#841584", // Меняем цвет при нажатии
                  transform: [{ scale: pressed ? 0.99 : 1 }], // Немного уменьшаем кнопку при нажатии
                },
                styles.battleButton,
              ]}
              onPress={openBattle}
            >
              <Image
                source={require("../assets/images/battleIcon.png")}
                style={{
                  width: 50,
                  height: 50,
                }}
                resizeMode="cover"
              />
            </Pressable>
          </View>

          <Pressable style={styles.resetButton} onPress={leaveAccount}>
            <Text style={styles.resetText}>Выйти из аккаунтa</Text>
          </Pressable>

          <Pressable style={styles.resetButton} onPress={confirmResetProgress}>
            <Text style={styles.resetText}>Сбросить прогресс</Text>
          </Pressable>

          <Pressable onPress={godmode}>
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 25,
  },
  upgradeButtonStyle: {
    padding: 15,
    backgroundColor: "purple",
    borderRadius: 5,
  },
  upgradeTextButtonStyle: {
    color: "white",
    fontSize: 15,
  },
  exchange: {
    borderColor: "black", // Цвет рамки
    borderStyle: "solid", // Тип рамки
    borderRadius: 8,
  },
  exchange_button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderColor: "black", // Цвет рамки
    borderStyle: "dashed", // Тип рамки
    borderWidth: 1.5, // Толщина рамки (добавьте, если рамка не отображается)
    borderRadius: 8,
  },
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
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
    width: "100%",
  },
  userInfo: {
    width: 104,
    maxWidth: 104,
    height: "auto",
    maxHeight: 50,
  },

  yourSalmonText: {
    fontSize: 11,
    textAlign: "center",
  },

  scrollUsername: {
    borderTopWidth: 2, // Толщина рамки
    borderTopColor: "#545454db", // Цвет рамки
    borderStyle: "solid", // Тип рамки
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 3,
    marginTop: 5,
  },

  scrollUsernameContentContainer: {
    flexGrow: 1,
    justifyContent: "center", // Центрирование содержимого
    alignItems: "center",
  },

  userName: {
    padding: 4,
    fontSize: 15,
    color: "white",
    flexWrap: "wrap",
  },

  changeSalmon: {
    width: 111,
    padding: 5,
  },

  btnGradientBorder: {
    padding: 2.2, // Отступ для градиентной рамки
    borderRadius: 10, // Радиус для закругления углов рамки
  },
  btn: {
    backgroundColor: "#141414dd", // Черный фон кнопки
    paddingVertical: 5,
    paddingHorizontal: 0,
    borderRadius: 8, // Радиус для закругления углов самой кнопки
  },
  btnText: {
    fontSize: 15,
    color: "#fff", // Белый цвет текста
    textAlign: "center",
  },
  btnPressed: {
    backgroundColor: "#333", // Темнее при нажатии
  },

  settingsMenu: {
    width: 104,
    alignItems: "flex-end",
  },

  settingsMenuButton: {
    borderRadius: 3,
    width: 80,
    backgroundColor: "#030303",
    paddingVertical: 7,
  },

  settingsMenuText: {
    textAlign: "center",
    color: "white",
  },

  title: {
    color: "red",
    fontSize: 20,
  },
  balanceTitle: {
    color: "blue",
    fontSize: 30,
  },
  mainButtonStyle: {
    padding: 5,
    height: 172,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c7c7c7d2",
    borderRadius: 100,
  },
  mainTextButtonStyle: {
    color: "white",
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

    borderColor: "black", // Цвет рамки
    borderStyle: "dotted", // Тип рамки
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
})
