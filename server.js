//Agar.io Clone
//Server.js is not the entry point.
// it creates our server and exports them

const express = require('express');
const app = express();
const socketIO = require('socket.io')

app.use(express.static(__dirname+'/public'));
const expressServer = app.listen(8001);
const io = socketIO(expressServer);


//You also can get the app and io from expressStuff/expressMain.js and socketStuff/socketMain.js  
module.exports = {
    app,
    io,
};