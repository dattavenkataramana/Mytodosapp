const express = require('express');
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3').verbose();
const cors = require("cors")
const app = express();
app.use(cors())
const PORT = process.env.PORT || 3000;
 
const db = new sqlite3.Database('./todos.db');


db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0
    )
  `);
});

app.use(express.json());

 
app.get('/todos', (req, res) => {
  db.all('SELECT * FROM todos', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/todos', (req, res) => {
  const { task } = req.body;
  if (!task) {
    res.status(400).json({ error: 'Task is required' });
    return;
  }
  db.run('INSERT INTO todos (task) VALUES (?)', [task], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, task: task, completed: false });
  });
});

app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;
  db.run('UPDATE todos SET task=?, completed=? WHERE id=?', [task, completed, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Todo updated successfully' });
  });
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM todos WHERE id=?', id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Todo deleted successfully' });
  });
});

 
app.listen(PORT, () => {
  console.log(`Server is Running on port http://localhost:${PORT}`);
});