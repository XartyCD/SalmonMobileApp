import {
  Platform,
  StyleSheet,
  TextInput,
  Text,
  View,
  Pressable,
  Image,
  Alert,
} from "react-native"
import React, { useState, useContext, useEffect, useRef } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAppContext } from "../context/context.js"
import NetInfo from "@react-native-community/netinfo"

import * as Clipboard from "expo-clipboard"

export default WelcomeScreen = ({ navigation }) => {
  const [nameWarn, setnameWarn] = useState("хэ")
  const { user, setUser, appVersion, checkInternetConnection, CONNECTURL } =
    useAppContext()
  const [checkedNewName, setCheckNewName] = useState(null)

  const [inputedKey, setInputedKey] = useState(null) // состояние для проверки при авторизации
  const [createKey, setCreateKey] = useState(null)
  const [secretKey, setSecretKey] = useState(null)

  const [needKey, setNeedKey] = useState(false)

  const blackListNames = [
    "nigger",
    "Ниггер",
    "Нигер",
    "Зеленский",
    "Макрон",
    "Niga",
    "Nigga",
    "Негр",
    "Negr",
    "Райан Гослинг",
    "Пабло Эксобар",
    "Байден",
    "Putin",
    "Путин",
    ".",
    "&",
    "?",
    "-",
    "~",
    "Зюзьга",
  ]

  // Проверка состояния сети при первом рендере компонента и каждые 60 секунд
  useEffect(() => {
    checkInternetConnection() // Проверка при первом рендере

    // const intervalId = setInterval(checkInternetConnection, 60000); // Проверка каждые 20 секунд

    // // Очистка интервала при размонтировании компонента
    // return () => clearInterval(intervalId);
  }, [])

  const askAccount = () => {
    Alert.alert("Такой лосось уже существует", "Это ваш аккаунт?", [
      { text: "Нет", style: "cancel" },
      { text: "Да", onPress: () => setNeedKey(true) },
    ])
  }

  const askCreatingSecretKey = () => {
    Alert.alert(
      "Защита лосося",
      "Хотите сгенерировать случайный секретный ключ, или введёте вручную?",
      [
        { text: "Ввести вручную", onPress: () => setCreateKey(true) },
        { text: "Сгенерировать случайно", onPress: () => createRandomSK() },
      ]
    )
  }

  // Генерация случайного ключа
  const createRandomSK = async () => {
    const minLength = 26
    const maxLength = 50
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?" // Символы, которые могут быть в ключе
    const keyLength =
      Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength

    let randomKey = ""
    for (let i = 0; i < keyLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      randomKey += characters[randomIndex]
    }
    setSecretKey(randomKey)

    Alert.alert(
      "Ваш ключ успешно сгенерирован",
      `${randomKey} \n\nОБЯЗАТЕЛЬНО СОХРАНИТЕ ЕГО!`,
      [
        {
          text: "Скопировать и сохранить ключ",
          onPress: () => {
            Clipboard.setStringAsync(randomKey)
            checkInputedKey(false, randomKey)
          },
        },
      ]
    )
  }

  // Проверка ключа при регистрации/при авторизации
  const checkInputedKey = async (authInput, secretKey) => {
    console.log(inputedKey)
    console.log(secretKey)
    const connected = await checkInternetConnection()
    if (connected) {
      if (authInput) {
        if (inputedKey.length <= 10) {
          setnameWarn("Слишком короткий! (от 10-х)")
        } else if (inputedKey.length > 50) {
          setnameWarn("Слишком длинный (до 50-ти)")
        } else {
          try {
            const response = await fetch(`${CONNECTURL}/confirmsecretkey`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: checkedNewName,
                key: inputedKey,
              }),
            })

            const data = await response.json()

            if (!data.success) {
              throw new Error(data.message)
            }

            if (data.message === "Неверный ключ") {
              // Прописать бан при неправильном ключе !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
              alert("Неверный ключ")
            } else if (data.message === "Аккаунт уже используется") {
              alert("Аккаунт уже используется")
            } else {
              // Пропускаем при правильном ключе
              console.log("Вход:", data)
              setUser(checkedNewName) // Записываем валидное введенное имя в состояние
            }
          } catch (error) {
            console.error("Ошибка при отправке данных:", error)
          }
        }
      } else {
        if (secretKey.length <= 10) {
          setnameWarn("Слишком короткий! (от 10-х)")
        } else if (secretKey.length > 50) {
          setnameWarn("Слишком длинный (до 50-ти)")
        } else {
          try {
            const response = await fetch(`${CONNECTURL}/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ checkedNewName, secretKey }),
            })

            const data = await response.json()

            if (!data.success) {
              throw new Error(data.message)
            } else {
              setUser(checkedNewName) // Записываем валидное введенное имя в состояние
            }
          } catch (error) {
            console.error("Ошибка при отправке данных:", error)
          }
        }
      }
    } else {
      setnameWarn("Нет подключения к интернету!")
    }
  }

  const saveUserName = async () => {
    const connected = await checkInternetConnection()
    if (connected) {
      if (checkedNewName.length <= 4 || checkedNewName === "") {
        setnameWarn("Слишком короткий! (от 4-х)")
      } else if (checkedNewName.length > 16) {
        setnameWarn("Слишком длинный (до 16-ти)")
      } else if (
        blackListNames.some((word) =>
          checkedNewName.toLowerCase().includes(word.toLowerCase())
        )
      ) {
        setnameWarn("Имя неприемлимо")
      } else {
        try {
          const response = await fetch(`${CONNECTURL}/checkusers`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ checkedNewName }),
          })

          const data = await response.json()

          if (!data.success) {
            throw new Error(data.message)
          }

          if (data.success === "already user") {
            askAccount()
          } else {
            askCreatingSecretKey()
          }
        } catch (error) {
          console.error("Ошибка при отправке данных:", error)
        }
      }
    } else {
      setnameWarn("Нет подключения к интернету!")
    }
  }
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={styles.warnSetNickname}>{nameWarn}</Text>

      {createKey ? (
        <>
          <Pressable
            style={styles.topButton}
            onPress={() => setCreateKey(false)} // Возврат на главную при аутентификации
          >
            <Text>Вернуться назад</Text>
          </Pressable>

          <Text>Создайте ключ для аккаунта {checkedNewName}</Text>
          <TextInput
            style={styles.input}
            placeholder="Секретный ключ"
            // Обновляем состояние при изменении текста
            onChangeText={(e) => setSecretKey(e)}
            // Привязка значения к input
          />
          <Pressable
            style={styles.topButton}
            onPress={() => checkInputedKey(false, secretKey)}
          >
            <Text>Продолжить</Text>
          </Pressable>
        </>
      ) : needKey ? (
        <>
          <Pressable
            style={styles.topButton}
            onPress={() => setNeedKey(false)} // Возврат на главную при аутентификации
          >
            <Text>Вернуться назад</Text>
          </Pressable>

          <Text>Введите ключ от аккаунта {checkedNewName}</Text>
          <TextInput
            style={styles.input}
            placeholder="Секретный ключ"
            // Обновляем состояние при изменении текста
            onChangeText={(e) => setInputedKey(e)}
            // Привязка значения к input
          />
          <Pressable
            style={styles.topButton}
            onPress={() => checkInputedKey(true)}
          >
            <Text>Продолжить</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text>Как назвать вашего лосося?</Text>
          <TextInput
            style={styles.input}
            placeholder="Имя лосося"
            // Обновляем состояние при изменении текста
            onChangeText={(e) => setCheckNewName(e)}
            // Привязка значения к input
          />
          <Pressable style={styles.topButton} onPress={saveUserName}>
            <Text>Продолжить</Text>
          </Pressable>
        </>
      )}

      <Text style={styles.version}>v.{appVersion}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  warnSetNickname: {
    padding: 4,
    backgroundColor: "#ff4f4fdb",
    color: "white",
    fontSize: 16,
  },
  topButton: {
    padding: 10,
    backgroundColor: "#c7c7c7d2",
    borderRadius: 30,
  },
  version: {
    margin: 100,
    fontSize: 14,
    color: "#e307b3",
  },
})
