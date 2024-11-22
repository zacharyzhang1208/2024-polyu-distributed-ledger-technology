const express = require('express')
const PORT = 3001
const cors = require('cors')
const app = express()
app.use(cors({ origin: 'http://127.0.0.1:5500' }))
app.get('/data', (req, res) => {
  res.json({
    name: 'cors in node.js',
    language: 'JavaScript',
    server: 'Express.js',
  })
})

app.get('/operator/wallets', (req, res) => {
    res.json({
        wallets: "Wallets"
    });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})