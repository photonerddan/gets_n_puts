//node chat server

var express = require('express'),
app = express();
io = require('socket.io').listen(app.listen(process.env.PORT || 5000)),
loggedON = [],
sockets = {};


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

app.get('/users', function(req, res){
  res.json(loggedON);
});

io.sockets.on('connection', function(client){
  client.on('join', function(name, gravatarURL){
    console.log(loggedON);
    sockets[gravatarURL] = {'name': name, 'client': client}
    loggedON.push({'name': name, 'gravatarURL': gravatarURL})
    client.broadcast.emit('refresh_users');

    client.on('message', function(msg, rgravatars, sgravatar){

      for (var i = 0; i < rgravatars.length; i++) {
        if ( sockets.hasOwnProperty(rgravatars[i]) ) {
          sockets[rgravatars[i]]['client'].emit('message', { msg: msg, sender: sgravatar });
        }
        else {
          client.emit('user_offline');
        }
      }
    });
    client.on('disconnect', function(){
      for( var i = 0; i < loggedON.length; i++) {
        if (loggedON[i]['gravatarURL'] === gravatarURL) {
           loggedON.splice(i, 1);
        }
      }
      delete sockets[gravatarURL];
      client.broadcast.emit('refresh_users');
    });
  });
});


