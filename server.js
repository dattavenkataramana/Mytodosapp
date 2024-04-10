const express = require('express');
const path = require('path');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3')
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json()); 

const dbPath = path.join(__dirname,"datatodos.db");

let db = null 

const initializeDbAndServer = async ()=>{
    try{
        db = await open({
            filename:dbPath,
            driver:sqlite3.Database,
        }) 
        app.listen(3000,()=>{
            console.log(`server running at http://localhost:3000`)
        })
    }catch(e){
        console.log(`DB Error :${e.message}`);
        process.exit(1)
    }
}


initializeDbAndServer()

app.get('/todos', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM todos');
        res.json(rows);
    } catch (error) {
        console.error(`Error fetching todos: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/todos', async (req, res) => {
    const { task } = req.body;
    if (!task) {
        return res.status(400).json({ error: 'Task is required' });
    }
    try {
        const result = await db.run('INSERT INTO todos (task) VALUES (?)', [task]);
        res.json({ id: result.lastID, task: task, completed: false });
    } catch (error) {
        console.error(`Error adding todo: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { task, completed } = req.body;
    try {
        await db.run('UPDATE todos SET task=?, completed=? WHERE id=?', [task, completed, id]);
        res.json({ message: 'Todo updated successfully' });
    } catch (error) {
        console.error(`Error updating todo: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM todos WHERE id=?', id);
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error(`Error deleting todo: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});
