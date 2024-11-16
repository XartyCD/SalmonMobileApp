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
  const { getAllDataFromAsyncStorage, user, setUser, sessionId, setSessionId, appVersion, checkInternetConnection, CONNECTURL } = useAppContext()
  const [checkedNewName, setCheckNewName] = useState("")

  const [forgottedAccount, setForgottedAccount] = useState(false)

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
  getAllDataFromAsyncStorage()


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



  // Генерация случайного id
  const createUniqueSessionId = async () => {
    const minLength = 10
    const maxLength = 25
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" // Символы, которые могут быть в ключе
    const keyLength =
      Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength

    let generatedSessionId = ""
    for (let i = 0; i < keyLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      generatedSessionId += characters[randomIndex]
    }

    return generatedSessionId

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
          const generatedSessionId = await createUniqueSessionId() // Создаем sessionId

          try {
            const response = await fetch(`${CONNECTURL}/confirmsecretkey`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: checkedNewName,
                key: inputedKey,
                sessionId: generatedSessionId,
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

            } else if (data.message === "Перегенерировать ключ") {
              checkInputedKey(true) // повторный вызов если ключ вдруг совпал

            } else {
              // Пропускаем при правильном ключе
              console.log("Вход:")
              setUser(checkedNewName) // Записываем валидное введенное имя в состояние
              setSessionId(generatedSessionId)
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
          const generatedSessionId = await createUniqueSessionId() // Создаем sessionId
          try {
            const response = await fetch(`${CONNECTURL}/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ checkedNewName, secretKey, sessionId: generatedSessionId }),
            })

            const data = await response.json()

            if (!data.success) {
              throw new Error(data.message)
            } else {
              // Пропускаем в аккаунт
              setUser(checkedNewName) // Записываем валидное введенное имя в состояние
              setSessionId(generatedSessionId)
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

  const saveUserName = async (forgot = false) => {
    const connected = await checkInternetConnection()
    if (connected) {
      if (checkedNewName === "" || checkedNewName.length <= 4) {
        setnameWarn("Слишком короткий! (от 4-х)")
      } else if (checkedNewName.length > 16) {
        setnameWarn("Слишком длинный (до 16-ти)")
      } else if (
        blackListNames.some((word) =>
          checkedNewName.toLowerCase().includes(word.toLowerCase())
        )
      ) {
        setnameWarn("Имя неприемлимо")
      } else if (forgot) {
        try {
          console.log("forgot")
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

          if (data.success === "Ожидание ключа") {
            setNeedKey(true)

          } else if (data.success === "already user") {
            setForgottedAccount(true)


          } else {
            setnameWarn("Такого лосося не существует")
          }
        } catch (error) {
          console.error("Ошибка при отправке данных:", error)
        }
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

          if (data.success === "Ожидание ключа" || data.success === "already user") {
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



  const forgotAccount = async (secretKey) => {
    const connected = await checkInternetConnection()
    if (connected) {
      if (secretKey.length <= 10) {
        setnameWarn("Слишком короткий! (от 10-х)")
      } else if (secretKey.length > 50) {
        setnameWarn("Слишком длинный (до 50-ти)")
      } else {
        const generatedSessionId = await createUniqueSessionId() // Создаем sessionId
        try {
          const response = await fetch(`${CONNECTURL}/forgotaccount`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: checkedNewName,
              key: secretKey,
              sessionId: generatedSessionId,
            }),
          })

          const data = await response.json()

          if (!data.success) {
            throw new Error(data.message)
          }

          if (data.message === "Неверный ключ") {
            // Прописать бан при неправильном ключе !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            alert("Неверный ключ")
          } else if (data.message === "Успешное восстановление") {
            // Пропускаем при правильном ключе
            console.log("Вход:")
            setUser(checkedNewName) // Записываем валидное введенное имя в состояние
            setSessionId(generatedSessionId)
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

      {forgottedAccount ? (
        <>
          <Pressable
            style={styles.topButton}
            onPress={() => setForgottedAccount(false)} // Возврат на главную при аутентификации
          >
            <Text>Вернуться назад</Text>
          </Pressable>

          <Text>Восстановить аккаунт {checkedNewName}</Text>
          <TextInput
            style={styles.input}
            placeholder="Секретный ключ"
            // Обновляем состояние при изменении текста
            onChangeText={(e) => setSecretKey(e)}
          // Привязка значения к input
          />
          <Pressable
            style={styles.topButton}
            onPress={() => forgotAccount(secretKey)}
          >
            <Text>Восстановить Аккаунт</Text>
          </Pressable>
        </>
      ) : createKey ? (
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

          <Text>Введите ключ от аккаунта {checkedNewName} для авторизации.</Text>
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
          <Pressable style={styles.topButton} onPress={() => saveUserName()}>
            <Text>Продолжить</Text>
          </Pressable>

          <Pressable style={styles.topButton} onPress={() => saveUserName(true)}>
            <Text>Забыли выйти из аккаунта?</Text>
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
