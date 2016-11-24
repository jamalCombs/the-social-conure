var socketio = require('socket.io')

module.exports.listen = function(server) {
  io = socketio.listen(server)

  io.on('connection', function(socket) {

    // console.log('hello' + socket.id);

    socket.on('disconnect', function() {
    });
  })

  io.on('meh', function(socket) {
    console.log('called');
    console.log('hello method', socket.id);
  })


  return io;


}
