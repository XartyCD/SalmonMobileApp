const express = require("express")
const mysql = require("mysql")

const http = require("http")
const socketIo = require("socket.io")

const app = express()
const port = 9000
const socketPort = 9003

const server = http.createServer(app)

// Настраиваем Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*", // Обеспечиваем доступ с любых источников, важно для работы с клиентом
  },
})

const pool = mysql.createPool({

  connectionLimit: 100, // Устанавливаем лимит соединений ;
  host: "localhost",
  user: "root",
  password: "",
  database: "SalmonGame",
})

// app.use(express.static(path.join(__dirname, 'public')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.use(express.json())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*") // Разрешить любые источники
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS") // Разрешить методы
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  ) // Указать заголовки
  next()
})

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err.stack)
    return
  }
  console.log("Подключено к базе данных как id " + connection.threadId)

  // Освобождаем соединение после успешного подключения
  connection.release()
})

app.get("/api/getrealtime", (req, res) => {
  const currentTime = Date.now()

  // Возвращаем текущее время
  res.status(200).json({ realTime: currentTime })
})

// API РЕГИСТРАЦИИ И АВТОРИЗАЦИИ

app.post("/api/checkusers", (req, res) => {
  const { checkedNewName } = req.body
  const query = "SELECT COUNT(*) AS count FROM regUsers WHERE user =?"
  pool.query(query, [checkedNewName], (error, results, fields) => {
    if (error) {
      console.error("Ошибка при выполнении запроса:", error)
      res.status(500).json({ success: false })
      return
    }

    if (results[0].count > 0) {

      const checkSessionId =
        "SELECT sessionId FROM regUsers WHERE user = ?"
      pool.query(checkSessionId, [checkedNewName], (error, results, fields) => {
        if (error) {
          console.error("Ошибка при смене статуса sessionId", error)
          res.status(500).json({
            success: false,
            message: "Ошибка при смене статуса sessionId",
          })
          return
        }

        if (results[0].sessionId === "0") {
          res.status(400).json({ success: "Ожидание ключа" }) // Пропуск как при обычной авторизации

        } else {
          res.status(200).json({ success: "already user" }) // Пропуск как при забытии аккаунта
        }
      })


    } else {
      res.status(200).json({ success: true })
    }
  })
})

app.post("/api/register", (req, res) => {
  const { checkedNewName, secretKey, sessionId } = req.body
  console.log(checkedNewName, secretKey)
  const query = "SELECT COUNT(*) AS count FROM regUsers WHERE user =?"
  pool.query(query, [checkedNewName], (error, results, fields) => {
    if (error) {
      console.error("Ошибка при выполнении запроса:", error)
      res.status(500).json({ success: false })
      return
    }

    if (results[0].count > 0) {
      res.status(400).json({ success: false })
    } else {
      const getCurrentTimeFormatted = () =>
        new Date().toISOString().replace("T", " ").slice(0, 19)
      const currentTime = getCurrentTimeFormatted() // Например: 2024-09-17 14:35:22

      const insertQuery =
        "INSERT INTO regUsers (user, secretKey, sessionId, regTime) VALUES (?, ?, ?, ?)"
      pool.query(
        insertQuery,
        [checkedNewName, secretKey, sessionId, currentTime],
        (error, results, fields) => {
          if (error) {
            console.error("Ошибка при выполнении запроса:", error)
            res.status(500).json({
              success: false,
              message: "Ошибка при записи времени входа",
            })
            return
          }
        }
      )

      const balance = 0
      const countTap = 0
      const insertQuery2 = `INSERT INTO userRating (user, balance, countTap) VALUES (?, ?, ?)`

      pool.query(insertQuery2, [checkedNewName, balance, countTap], (error, results) => {
        if (error) {
          console.error("Ошибка при отправке баланса на сервер:", error)
          res.status(500).json({ success: false, message: "Ошибка баланса" })
          return
        }
      })

      res.status(200).json({
        success: true,
        message: "Время входа успешно записано и личный рейтинг создан",
      })
    }
  })
})

app.post("/api/confirmsecretkey", (req, res) => {
  const { username, key, sessionId } = req.body
  const query = "SELECT secretKey, sessionId FROM regUsers WHERE BINARY user = ?"

  pool.query(query, [username], (error, results, fields) => {
    if (error) {
      console.error("Ошибка при выполнении запроса:", error)
      res.status(500).json({ message: "Произошла ошибка при аутентификации" })
      return
    }

    if (results.length === 1) {

      if (key === results[0].secretKey) {
        if (results[0].sessionId === "0") {
          const updateSessionId =
            "UPDATE regUsers SET sessionId = ? WHERE user = ?"
          pool.query(updateSessionId, [sessionId, username], (error, results, fields) => {
            if (error) {
              console.error("Ошибка при смене статуса sessionId", error)
              res.status(500).json({
                success: false,
                message: "Ошибка при смене статуса sessionId",
              })
              return
            }
          })
          res.status(200).json({ message: "Успешная авторизация", success: true })

        } else if (results[0].sessionId === sessionId) {
          res.status(200).json({ message: "Перегенерировать ключ", success: true })

        } else {
          res.status(200).json({ message: "Аккаунт уже используется", success: true })
        }
      } else {
        res.status(200).json({ message: "Неверный ключ", success: true })
      }
    } else {
      res.status(200).json({ message: "Пользователь не найден" })
    }
  })
})


app.post("/api/firstdataload", (req, res) => {
  const { user } = req.body

  // Запрос для получения всех сообщений, сортированных по времени
  const query = "SELECT * FROM userRating WHERE user = ?"

  pool.query(query, [user], (error, results) => {
    if (error) {
      console.error(
        "Ошибка при выполнении загрузки данных из дб:",
        error
      )
      res
        .status(500)
        .json({ success: false, message: "Ошибка при получении первичных данных из дб" })
      return
    }

    // Возвращаем список рейтинга
    res.status(200).json({ success: true, date: results })
  })
})




// API РЕГИСТРАЦИИ И АВТОРИЗАЦИИ

// ВЫЙТИ ИЗ АККАУНТА

app.post("/api/leave-account", (req, res) => {
  const { user, balance, countTap } = req.body

  const saveDataQuery = "UPDATE userRating SET balance = ?, countTap = ? WHERE user = ?"

  pool.query(saveDataQuery, [balance, countTap, user], (error, results) => {
    if (error) {
      console.error("Ошибка при обновлении польз данных:", error)
      res.status(500).json({ success: false, message: "Ошибка при обновлении данных польз" })
      return
    }

    // Заменить sessionId на 0
    const leaveQuery = `UPDATE regUsers SET sessionId = 0 WHERE user = ?`

    pool.query(leaveQuery, [user], (error, results) => {
      if (error) {
        console.error("Ошибка при замене sessionId при выходе:", error)
        res.status(500).json({ success: false, message: "Ошибка выхода" })
        return
      }

      res.status(200).json({ success: true, message: "Успешный выход и сохранение данных в базе" })
    })
  }
  )
})

// API УДАЛЕНИЕ АККАУНТА

app.delete("/api/delete-account", (req, res) => {
  const { user } = req.body

  // Удалить лосося пользователя
  const deleteUserReg = "DELETE FROM regUsers WHERE user = ?"
  pool.query(deleteUserReg, [user], (error, results) => {
    if (error) {
      console.error("Ошибка при удалении userReg:", error)
      res.status(500).json({ success: false, message: "Ошибка при userReg" })
      return
    }
    res.status(200).json({ success: true, message: "Пользователь удален." })

    const deleteUserRating = "DELETE FROM userRating WHERE user = ?"
    pool.query(deleteUserRating, [user], (error, results) => {
      if (error) {
        console.error("Ошибка при удалении рейтинга пользователя:", error)
        res.status(500).json({
          success: false,
          message: "Ошибка при удалении рейтинга пользователя",
        })
        return
      }
    })
  })
})

// API УДАЛЕНИЕ АККАУНТА



//API ПРОВЕРКИ ЧТО УНИКАЛЬНЫЙ ID ВСЕ ЕЩЕ В БАЗЕ (ДЛЯ АВТОРИЗОВАННЫХ)

app.post("/api/checksessionid", (req, res) => {
  const { username, sessionId } = req.body
  const query = "SELECT sessionId FROM regUsers WHERE user = ?"
  pool.query(query, [username], (error, results, fields) => {
    if (error) {
      console.error("Ошибка при выполнении запроса:", error)
      res.status(500).json({ success: false })
      return
    }

    if (results[0].sessionId != sessionId) {
      res.status(400).json({ message: "Сессия недействительна" })
    } else {
      res.status(200).json({ success: true })
    }
  })
})

//API ПРОВЕРКИ ЧТО УНИКАЛЬНЫЙ ID ВСЕ ЕЩЕ В БАЗЕ (ДЛЯ АВТОРИЗОВАННЫХ)


// API ДЛЯ ВЫБРОСА ИЗ АККАУНТА

app.post("/api/forgotaccount", (req, res) => {
  const { username, key, sessionId } = req.body
  const query = "SELECT secretKey FROM regUsers WHERE user = ?"

  pool.query(query, [username], (error, results, fields) => {
    if (error) {
      console.error("Ошибка при выполнении запроса:", error)
      res.status(500).json({ message: "Произошла ошибка при аутентификации" })
      return
    }

    if (results.length === 1) {

      if (key === results[0].secretKey) {
        const updateSessionId = "UPDATE regUsers SET sessionId = ? WHERE user = ?"
        pool.query(updateSessionId, [sessionId, username], (error, results, fields) => {
          if (error) {
            console.error("Ошибка при смене sessionId", error)
            res.status(500).json({
              success: false,
              message: "Ошибка при смене sessionId",
            })
            return
          }
        })
        res.status(200).json({ message: "Успешное восстановление", success: true })
      } else {
        res.status(200).json({ message: "Неверный ключ", success: true })
      }
    } else {
      res.status(200).json({ message: "Пользователь не найден" })
    }
  })
})

// API ДЛЯ ВЫБРОСА ИЗ АККАУНТА


// API РЕЙТИНГА

app.get("/api/gettoprating", (req, res) => {
  // Запрос для получения всех сообщений, сортированных по времени
  const query = "SELECT * FROM userRating ORDER BY balance DESC;"

  pool.query(query, (error, results) => {
    if (error) {
      console.error(
        "Ошибка при выполнении запроса на получение рейтинга:",
        error
      )
      res
        .status(500)
        .json({ success: false, message: "Ошибка при получении рейтинга" })
      return
    }

    // Возвращаем список рейтинга
    res.status(200).json({ success: true, rating: results })
  })
})

app.post("/api/postyourrating", (req, res) => {
  const { user, balance, countTap } = req.body

  const insertQuery = `UPDATE userRating SET balance = ?, countTap = ? WHERE user = ?`

  pool.query(insertQuery, [balance, countTap, user], (error, results) => {
    if (error) {
      console.error("Ошибка при отправке локальных данных:", error)
      res.status(500).json({ success: false, message: "Ошибка отправки локальных данных" })
      return
    }

    res.status(200).json({ success: true, message: "Личные данные на сервере обновлены!" })
  })
})

// API РЕЙТИНГА

// API ЧАТА

app.get("/api/getmessagesglobalchat", (req, res) => {
  // Запрос для получения всех сообщений, сортированных по времени
  const query = "SELECT * FROM chatlogs ORDER BY time ASC;"

  pool.query(query, (error, results) => {
    if (error) {
      console.error(
        "Ошибка при выполнении запроса на получение сообщений:",
        error
      )
      res
        .status(500)
        .json({ success: false, message: "Ошибка при получении сообщений" })
      return
    }

    // Возвращаем список сообщений
    res.status(200).json({ success: true, messages: results })
  })
})

app.post("/api/sendmessageglobalchat", (req, res) => {
  const { user, sendingMessage } = req.body

  const getCurrentTimeFormatted = () =>
    new Date().toISOString().replace("T", " ").slice(0, 19)
  const currentTime = getCurrentTimeFormatted() // Например: 2024-09-17 14:35:22

  // Получаем текущее количество сообщений пользователя, чтобы создать уникальный UMI
  const umiQuery =
    "SELECT COUNT(*) as messageCount FROM chatlogs WHERE user = ?"

  pool.query(umiQuery, [user], (error, results) => {
    if (error) {
      console.error(
        "Ошибка при выполнении запроса на получение количества сообщений:",
        error
      )
      res.status(500).json({
        success: false,
        message: "Ошибка при получении количества сообщений",
      })
      return
    }

    // Получаем UMI (messageCount + 1)
    const umi = results[0].messageCount + 1

    // Вставляем новое сообщение в базу данных с UMI
    const insertQuery =
      "INSERT INTO chatlogs (user, message, time, UMI) VALUES (?, ?, ?, ?)"

    pool.query(
      insertQuery,
      [user, sendingMessage, currentTime, umi],
      (error, results) => {
        if (error) {
          console.error(
            "Ошибка при выполнении запроса на отправку сообщения:",
            error
          )
          res
            .status(500)
            .json({ success: false, message: "Ошибка при отправке сообщения" })
          return
        }

        res
          .status(200)
          .json({ success: true, message: "Сообщение добавлено", umi })
      }
    )
  })
})

// API ЧАТА

let games = {}

io.on("connection", (socket) => {
  console.log("A user connected")

  // Создание новой игры
  socket.on("createGame", (gameName, playerName, bet) => {
    console.log(gameName, playerName, bet)

    const getCurrentTimeFormatted = () =>
      new Date().toISOString().replace("T", " ").slice(0, 19)
    const currentTime = getCurrentTimeFormatted() // Например: 2024-09-17 14:35:22

    const gamesquery =
      "SELECT COUNT(*) as games FROM poolPongGame WHERE game_id"

    pool.query(gamesquery, (error, results) => {
      if (error) {
        console.error(
          "Ошибка при выполнении запроса на получение id игр:",
          error
        )
        res
          .status(500)
          .json({ success: false, message: "Ошибка при получении id игр" })
        return
      }

      // Получаем UMI (messageCount + 1)
      const game_id = results[0].games + 1

      // Вставляем новую игру в базу данных с game_id
      const insertQuery =
        "INSERT INTO poolPongGame (game_id, gamename, player1, bet, time) VALUES (?, ?, ?, ?, ?)"

      pool.query(
        insertQuery,
        [game_id, gameName, playerName, bet, currentTime],
        (error, res) => {
          if (error) {
            console.error(
              "Ошибка при выполнении запроса на отправку сообщения:",
              error
            )
            res.status(500).json({
              success: false,
              message: "Ошибка при отправке сообщения",
            })
            return
          }

          socket.emit("createGameSuccess", {
            success: true,
            game_id,
            message: "Игра успешно создана",
          }) // number
        }
      )

      games[game_id] = {
        gameName: gameName,
        bet: bet,
        currentTime: currentTime,
        players: {},
      }

      games[game_id].players[socket.id] = {
        playerName,
        position: { x: 0, y: 0 },
      }

      socket.join(game_id) // !!!!!
      console.log(game_id, "a")

      const room = io.sockets.adapter.rooms.get(game_id)

      if (room) {
        const clients = Array.from(room) // Преобразуем Set в массив
        console.log("Пользователи в комнате:", clients)
      } else {
        console.log("Комната не найдена.")
      }
    })
  })

  // Присоединение ко второй игре
  socket.on("joingame", ({ game_id, playerName }) => {
    if (games[game_id] && Object.keys(games[game_id].players).length === 1) {
      games[game_id].players[socket.id] = {
        playerName,
        position: { x: 0, y: 0 },
      }

      socket.emit("startGame", game_id)
      console.log(`${playerName} присоединился к игре ${game_id}`)
      socket.join(game_id) // Добавляем игрока в комнату

      console.log(typeof game_id)

      const room = io.sockets.adapter.rooms.get(game_id)

      if (room) {
        const clients = Array.from(room) // Преобразуем Set в массив
        console.log("Пользователи in комнате:", clients)
      } else {
        console.log("Комната не найдена.")
      }

      io.to(game_id).emit("go") // Отправляем данные об игре
      console.log(games)
    } else {
      socket.emit(
        "error",
        "Невозможно присоединиться к игре. Либо игра не найдена, либо уже заполнена."
      )
    }
  })

  // Перемещение игрока
  socket.on("playerMove", ({ game_id, position }) => {
    if (games[game_id] && games[game_id].players[socket.id]) {
      games[game_id].players[socket.id].position = position
      io.to(game_id).emit("updateGame", games[game_id].players)
    }
  })

  // Перемещение мяча
  socket.on("ballMove", ({ game_id, x, y }) => {
    io.to(game_id).emit("updateBall", { x, y }) // Обновляем позицию мяча для всех игроков
  })

  // Обработка отключения игрока
  socket.on("disconnect", () => {
    console.log("A user disconnected")
    for (const game_id in games) {
      if (games[game_id].players[socket.id]) {
        delete games[game_id].players[socket.id]
        if (Object.keys(games[game_id].players).length === 0) {
          delete games[game_id]
        }
      }
    }
  })
})

// Маршрут для получения списка игр
app.get("/api/getlistgames", (req, res) => {
  const query = "SELECT * FROM poolPongGame ORDER BY time ASC;"

  pool.query(query, (error, results) => {
    if (error) {
      console.error("Ошибка при получении игр:", error)
      res
        .status(500)
        .json({ success: false, message: "Ошибка при получении игр" })
      return
    }

    res.status(200).json({ success: true, ponggames: results })
  })
})

app.get("/api/checkappinfo", (req, res) => {
  // Запрос для получения всех сообщений, сортированных по времени
  const query = "SELECT version FROM actualInfoApp"

  pool.query(query, (error, results) => {
    if (error) {
      console.error("Ошибка при полчении инфо о приложении:", error)
      res.status(500).json({
        success: false,
        message: "Ошибка при получении данных о приложении",
      })
      return
    }

    // Возвращаем список сообщений
    res.status(200).json({ success: true, info: results })
  })
})

app.listen(port, "0.0.0.0", () => {
  console.log(`Сервер успешно запущен на порту ${port}`)
})

server.listen(socketPort, "0.0.0.0", () => {
  console.log(`Сокеты запущены на порту ${socketPort}`)
})
