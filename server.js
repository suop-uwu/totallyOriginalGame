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

function arrayRemove(arr, value) {

    return arr.filter(function (ele) {
        return ele != value;
    });

}

var currentPlayers = [];
var currentPlayersData = [];
io.on('connection', function (socket) {
    var playerName;
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
        if (playerName !== undefined) {
            currentPlayers = arrayRemove(currentPlayers, playerName);
            for (let i = 0; i < currentPlayersData.length; i++) {
                if (currentPlayersData[i].name === playerName) {
                    currentPlayersData.splice(i, 1);
                }
            }
        }
        socket.broadcast.emit('playerData', currentPlayersData);
    });

    socket.on('nameRequest', function (name) {
        if (typeof name === 'string') {
            if (currentPlayers.includes(name)) {
                socket.emit('nameRequest', false);
            } else {
                currentPlayers.push(name);
                playerName = name;
                socket.emit('nameRequest', true);
            }
        }
    });

    socket.on('playerData', function (data) {
        var playerAlreadyIn = false;
        for (let i = 0; i < currentPlayersData.length; i++) {
            if (currentPlayersData[i].name === data.name) {
                playerAlreadyIn = true;
                currentPlayersData[i] = data;
            }
        }
        if (playerAlreadyIn === false) {
            currentPlayersData.push(data);
        }
        socket.broadcast.emit('playerData', currentPlayersData);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});