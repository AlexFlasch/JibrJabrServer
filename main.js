var util = require('util');

var PORT = 3000;

var io = require('socket.io')(PORT);

var clients = {};

var Firebase = require('firebase');
var firebaseUrl = 'https://jibrjabr.firebaseio.com/';

var db = new Firebase(firebaseUrl);

io.on('connection', function(socket) {
    clients[socket.id] = socket;
    console.log('client connected with sessionID: ' + socket.id);

    // send the clients id to the client itself.
    socket.emit('conn:success', socket.id);

    // data contains:
    //// email: String
    //// password: String
    //// sessionID: String
    socket.on('user:login', function(data) {
        var userRef = new Firebase(firebaseUrl);

        userRef.authWithPassword({
            email: data.email,
            password: data.password
        }, function(err, authData) {
            if(err) {
                if(io.sockets.connected[data.sessionID]) {
                    io.sockets.connected[data.sessionID].emit('user:loggedin', {
                        success: false,
                        msg: 'Login failed. Please check your information and try again.'
                    });
                }
            }
            else {
                console.log('User logged in with payload: ' + util.inspect(authData));
                if(io.sockets.connected[data.sessionID]) {
                    io.sockets.connected[data.sessionID].emit('user:loggedin', {
                        success: true,
                        msg: 'Login successful.'
                    });
                }
            }
        });
    });

    // data contains:
    //// email: String
    //// password: String
    //// sessionID: String
    socket.on('user:register', function(data) {
        console.log(data);

        if(data.email === undefined ||
           data.password === undefined){
               if(io.sockets.connected[data.sessionID]) {
                   io.sockets.connected[data.sessionID].emit('user:registered', {
                       success: false,
                       msg: 'Either email or password was not provided.'
                   });
               }
        }

        db.createUser({
            email: data.email,
            password: data.password
        }, function(err, user) {
            if(err) console.log(err);

            var success = user !== undefined;

            if(io.sockets.connected[data.sessionID]) {
                io.sockets.connected[data.sessionID].emit('user:registered', {
                    success: success
                });
            }
        });
    });

    // data contains:
    //// email: String
    //// password: String
    //// displayName: String
    socket.on('user:changeDisplayName', function(data) {

    });

    // data contains:
    //// msg: Object
    ////// content: String
    //// sessionID: String
    socket.on('msg:sent', function(data) {

    });

    // data contains:
    //// roomName: String
    //// sessionID: String
    socket.on('room:created', function(data) {

    });

    // data contains:
    //// roomName: String
    //// sessionID: String
    socket.on('room:joined', function(data) {

    });

    // data contains:
    //// roomName: String
    //// sessionID: String
    socket.on('room:left', function(data) {

    });

    // data contains:
    //// sessionID: String
    socket.on('disconnect', function() {
        console.log('A user has disconnected');
    });
});

console.log('Listening on port ' + PORT);
