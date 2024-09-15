const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 9000;

const pool = mysql.createPool({
  connectionLimit: 10, // Устанавливаем лимит соединений
  host: '37.139.62.40',
  user: 'root',
  password: 'Ex239763251',
  database: 'SalmonGame'
});

app.use(express.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
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

pool.getConnection((err, connection) => {
  if (err) throw err;
  // Используй соединение
  connection.query('SELECT * FROM regUsers', (error, results) => {
    connection.release(); // Обязательно освободи соединение
    if (error) throw error;
    console.log(results);
  });
});




app.post('/register', (req, res) => {
  const { checkedNewName, currentTime } = req.body;
  console.log(checkedNewName)
  const datetime = new Date(currentTime);
  
  datetime.setHours(datetime.getHours() + 3);
  const formattedDatetime = datetime.toISOString().replace('T', ' ').slice(0, 19);
  
  const insertQuery = 'INSERT INTO regUsers (user, regTime) VALUES (?, ?)';
  
  pool.query(insertQuery, [checkedNewName, formattedDatetime], (error, results, fields) => {
    if (error) {
      console.error('Ошибка при выполнении запроса:', error);
      res.status(500).json({ success: false, message: 'Ошибка при записи времени входа' });
      return;
    }

    res.status(200).json({ success: true, message: 'Время входа успешно записано' });
  });
});



app.delete('/delete-account', (req, res) => {
  const { user } = req.body;

  // Удалить заявки пользователя
  const deleteUserReg = 'DELETE FROM regUsers WHERE user = ?';
  pool.query(deleteUserReg, [user], (error, results) => {
    if (error) {
      console.error('Ошибка при удалении userReg:', error);
      res.status(500).json({ success: false, message: 'Ошибка при userReg' });
      return;
    }
    res.status(200).json({ success: true, message: 'Пользователь удален.' });


    // const deleteUserHistory = 'DELETE FROM history WHERE login = ?';
    // pool.query(deleteUserHistory, [login], (error, results) => {
    //   if (error) {
    //     console.error('Ошибка при удалении посещений пользователя:', error);
    //     res.status(500).json({ success: false, message: 'Ошибка при удалении посещений пользователя' });
    //     return;
    //   }})


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




app.listen(port, '0.0.0.0', () => {
  console.log(`Сервер успешно запущен на порту ${port}`);
});
