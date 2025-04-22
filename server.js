const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// 中间件
app.use(cors()); // 允许所有来源的跨域请求
app.use(express.json());

// 创建 MySQL 连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Qxx074688',
    database: 'todo_app',
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

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
