const express = require('express')
const path = require('path')

const app = express()

app.use('/static', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'))
})
app.get('/rules', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/rules.html'))
})

app.listen(3000, () => {console.log('Started...')})