var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/players.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    // db.each(`SELECT PlaylistId as id,
    //                 Name as name
    //          FROM playlists`, (err, row) => {
    //     if (err) {
    //         console.error(err.message);
    //     }
    //     console.log(row.id + "\t" + row.name);
    // });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Closed the database connection.');
});

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var currentPlayers = [];
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('nameRequest', function (name) {
        if (typeof name === 'string') {
            if (currentPlayers.includes(name)) {
                socket.emit('nameRequest', false);
            } else {
                currentPlayers.push(name);
                socket.emit('nameRequest', true);
            }
        }
    });

    socket.on('playerData', function (data) {
        io.emit('playerData', data);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});