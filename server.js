const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config(); // 加载环境变量
const app = express();

// 中间件
app.use(cors()); // 允许所有来源的跨域请求
app.use(express.json());

// 创建 MySQL 连接池，使用环境变量配置数据库
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',      // 使用环境变量（本地开发时可使用 localhost）
    user: process.env.DB_USER || 'root',           // 使用环境变量
    password: process.env.DB_PASSWORD || '',       // 使用环境变量
    database: process.env.DB_NAME || 'todo_app',   // 使用环境变量
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 路由：获取所有 Todo
app.get('/todos', (req, res) => {
    pool.promise().query('SELECT * FROM todos')
        .then(([rows]) => {
            res.json(rows);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        });
});

// 路由：创建一个新的 Todo
app.post('/todos', (req, res) => {
    const { text } = req.body;
    pool.promise().query('INSERT INTO todos (text) VALUES (?)', [text])
        .then(([result]) => {
            const newTodo = {
                id: result.insertId,
                text: text
            };
            res.status(201).json(newTodo);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        });
});

// 路由：删除一个 Todo
app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    pool.promise().query('DELETE FROM todos WHERE id = ?', [id])
        .then(([result]) => {
            if (result.affectedRows > 0) {
                res.json({ message: 'Todo deleted successfully' });
            } else {
                res.status(404).json({ message: 'Todo not found' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        });
});

// 监听端口
const PORT = process.env.PORT || 5500; // 使用 Glitch 提供的动态端口或本地默认端口
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
