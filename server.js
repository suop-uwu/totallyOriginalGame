const express = require('express');
const app = express();
const port = 3000;
var indexRouter = require('./routes/index');
app.use(express.static(__dirname + '/public'));
app.get('/game', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/test', function (req, res) {
    res.send('request served');
});
app.listen(port, () => console.log(`App listening on port ${port}!`));