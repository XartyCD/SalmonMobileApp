const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 9000;

const pool = mysql.createPool({
  connectionLimit: 100, // Устанавливаем лимит соединений
  host: '194.87.215.107',
  user: 'root',
  password: '7G$11te2iOH8^q&!qU71E2T82lO0$%sc6Xizk!I82',  
  database: 'SalmonGame'
  // connectionLimit: 100, // Устанавливаем лимит соединений ;
  // host: 'localhost',
  // user: 'root',
  // password: '',
  // database: 'SalmonGame'
});



app.use(express.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');  // Разрешить любые источники
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');  // Разрешить методы
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');  // Указать заголовки
  next();
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.stack);
    return;
  }
  console.log('Подключено к базе данных как id ' + connection.threadId);

  // Освобождаем соединение после успешного подключения
  connection.release();
});



app.post('/register', (req, res) => {
  const { checkedNewName } = req.body;
  console.log(checkedNewName)
  const query = 'SELECT COUNT(*) AS count FROM regUsers WHERE user =?';
  pool.query(query, [checkedNewName], (error, results, fields) => {
    if (error) {
      console.error('Ошибка при выполнении запроса:', error);
      res.status(500).json({ success: false });
      return;
    }

    if (results[0].count > 0) {
      res.status(400).json({ success: "already user" });
    } else {
      // Регистрация нового пользователя
      const getCurrentTimeFormatted = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

      const currentTime = getCurrentTimeFormatted(); // Например: 2024-09-17 14:35:22
      
      const insertQuery = 'INSERT INTO regUsers (user, regTime) VALUES (?, ?)';
      
      pool.query(insertQuery, [checkedNewName, currentTime], (error, results, fields) => {
        if (error) {
          console.error('Ошибка при выполнении запроса:', error);
          res.status(500).json({ success: false, message: 'Ошибка при записи времени входа' });
          return;
        }

        res.status(200).json({ success: true, message: 'Время входа успешно записано' });
      });
    }
  });
});

app.delete('/delete-account', (req, res) => {
  const { user } = req.body;

  // Удалить лосося пользователя
  const deleteUserReg = 'DELETE FROM regUsers WHERE user = ?';
  pool.query(deleteUserReg, [user], (error, results) => {
    if (error) {
      console.error('Ошибка при удалении userReg:', error);
      res.status(500).json({ success: false, message: 'Ошибка при userReg' });
      return;
    }
    res.status(200).json({ success: true, message: 'Пользователь удален.' });


    const deleteUserRating = 'DELETE FROM userRating WHERE user = ?';
    pool.query(deleteUserRating, [user], (error, results) => {
      if (error) {
        console.error('Ошибка при удалении рейтинга пользователя:', error);
        res.status(500).json({ success: false, message: 'Ошибка при удалении рейтинга пользователя' });
        return;
      }})


    // // Удалить пользователя
    // const deleteUserQuery = 'DELETE FROM authed WHERE login = ?';
    // pool.query(deleteUserQuery, [login], (error, results) => {
    //   if (error) {
    //     console.error('Ошибка при удалении пользователя:', error);
    //     res.status(500).json({ success: false, message: 'Ошибка при удалении пользователя' });
    //     return;
    //   }

    //   res.status(200).json({ success: true, message: 'Пользователь и все его заявки успешно удалены' });
    // });
  });
});

app.get('/gettoprating', (req, res) => {
  // Запрос для получения всех сообщений, сортированных по времени
  const query = 'SELECT * FROM userRating ORDER BY balance DESC;';
  
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Ошибка при выполнении запроса на получение рейтинга:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении рейтинга' });
      return;
    }

    // Возвращаем список рейтинга
    res.status(200).json({ success: true, rating: results });
  });
});

app.post('/createyourrating', (req, res) => {
  const { checkedNewName, balance } = req.body;

  const insertQuery = `INSERT INTO userRating (user, balance) VALUES (?, ?)`
  
  pool.query(insertQuery, [checkedNewName, balance], (error, results) => {
    if (error) {
      console.error('Ошибка при отправке баланса на сервер:', error);
      res.status(500).json({ success: false, message: 'Ошибка баланса' });
      return;
    }

    res.status(200).json({ success: true, message: 'Личный рейтинг обновлен' });
  });
});


app.post('/postyourrating', (req, res) => {
  const { user, balance } = req.body;

  const insertQuery = `UPDATE userRating SET balance = ? WHERE user = ?`
  
  pool.query(insertQuery, [balance, user], (error, results) => {
    if (error) {
      console.error('Ошибка при отправке баланса на сервер:', error);
      res.status(500).json({ success: false, message: 'Ошибка баланса' });
      return;
    }

    res.status(200).json({ success: true, message: 'Личный рейтинг обновлен' });
  });
});




app.get('/getmessagesglobalchat', (req, res) => {
  // Запрос для получения всех сообщений, сортированных по времени
  const query = 'SELECT * FROM chatlogs ORDER BY time ASC;';
  
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Ошибка при выполнении запроса на получение сообщений:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении сообщений' });
      return;
    }

    // Возвращаем список сообщений
    res.status(200).json({ success: true, messages: results });
  });
});


app.post('/sendmessageglobalchat', (req, res) => {
  const { user, sendingMessage } = req.body;

  const getCurrentTimeFormatted = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
  const currentTime = getCurrentTimeFormatted(); // Например: 2024-09-17 14:35:22


  // Получаем текущее количество сообщений пользователя, чтобы создать уникальный UMI
  const umiQuery = 'SELECT COUNT(*) as messageCount FROM chatlogs WHERE user = ?';

  pool.query(umiQuery, [user], (error, results) => {
    if (error) {
      console.error('Ошибка при выполнении запроса на получение количества сообщений:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении количества сообщений' });
      return;
    }

    // Получаем UMI (messageCount + 1)
    const umi = results[0].messageCount + 1;

    // Вставляем новое сообщение в базу данных с UMI
    const insertQuery = 'INSERT INTO chatlogs (user, message, time, UMI) VALUES (?, ?, ?, ?)';
    
    pool.query(insertQuery, [user, sendingMessage, currentTime, umi], (error, results) => {
      if (error) {
        console.error('Ошибка при выполнении запроса на отправку сообщения:', error);
        res.status(500).json({ success: false, message: 'Ошибка при отправке сообщения' });
        return;
      }

      res.status(200).json({ success: true, message: 'Сообщение добавлено', umi });
    });
  });
});


app.get('/checkappinfo', (req, res) => {
  // Запрос для получения всех сообщений, сортированных по времени
  const query = 'SELECT version FROM actualInfoApp';
  
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Ошибка при полчении инфо о приложении:', error);
      res.status(500).json({ success: false, message: 'Ошибка при получении данных о приложении' });
      return;
    }

    // Возвращаем список сообщений
    res.status(200).json({ success: true, info: results });
  });
});





app.listen(port, '0.0.0.0', () => {
  console.log(`Сервер успешно запущен на порту ${port}`);
});
