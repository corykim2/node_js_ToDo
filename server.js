const express = require('express');
const path = require('path');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 8080;

const uri = 'mongodb://localhost:27017'; // 로컬 MongoDB 기본 포트라네
const dbName = 'todoApp';
let db;

//DB 연결
MongoClient.connect(uri)
    .then((client) => {
        console.log('MongoDB 연결 완료');
        db = client.db(dbName);
    })
    .catch((err) => {
        console.error('MongoDB 연결 실패:', err);
    });

//정적파일
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/todos', async (req, res) => {
    const { todo } = req.body;

    if (!todo) {
        return res.status(400).json({ error: '할 일 내용이 없습니다.' });
    }

    try {
        const result = await db.collection('todos').insertOne({
            text: todo,
            createdAt: new Date()
        });

        res.status(201).json({ message: '할 일이 저장되었습니다!', id: result.insertedId });
    } catch (err) {
        console.error('DB 저장 오류:', err);
        res.status(500).json({ error: '서버 오류' });
    }
});

app.get('/todos', async (req, res) => {
    try {
        const todos = await db.collection('todos').find().sort({ createdAt: -1 }).toArray();
        res.json(todos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '서버 오류' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});