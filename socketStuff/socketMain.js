//The purpose of socketMain is to be the entrypoint for all Socket Staffs
const io = require("../server").io;

//====================== CLASSES ======================
const Orb = require("./classes/Orb");
const Player = require("./classes/Player");
const PlayerData = require("./classes/PlayerData");
const PlayerConfig = require("./classes/PlayerConfig");
const { checkForOrbCollisions, checkForPlayerCollisions } = require("./checkCollisions");
//=====================================================

//make an orbs array that will host all 500/500 NOT PLAYER Orbs
//every time one is absorb , the server will make a new one
const orbs = [];
const players = []; //player connected to a game /  room
const settings = {
  defaultNumberOfOrbs: 5000, //number of orbs on the map
  defaultSpeed: 6, //player speed
  defaultSize: 6, //default player size
  defaultZoom: 1.5, //as the player gets bigger, Zoom needs to go out
  worldWidth: 5000,
  worldHeight: 5000,
  defaultGenericOrbSize: 5, // smaller than player orbs
};
let pingPongInterval;
const playersForUsers = [];
//on server start , to make our initial 500 NON PLAYER ORBS
initGame();
//================================== SOCKET EVENT LISTENERS =============================

io.on("connect", (socket) => {
  //a player has connected
  let player = {};

  //INIT:SEND only happen when the client will start the game
  socket.on("init:send", ({ playerName }, ackCallBack) => {
    //ping-pong - issue an event to EVERY connected socket , that is playing the game , 30 times per second
    // run it only when the 1st player join the room
    if (players.length === 0) {
      pingPongInterval = setInterval(() => {
        io.to("game").emit("ping", playersForUsers); //Send the event to 'GAME' ROOM
      }, 33); /* (1000/30) = 33.333333 there are 33 , 30's in 1000 millisecond  , 1/30 th of a second or 1 of 30 fps */
    }
    socket.join("game"); //Socke is added to the "GAME" ROOM
    //make a playerConfig object only the Player needs to know
    const playerConfig = new PlayerConfig(settings);
    //make a  playerData object that data specific to the player that everybody needs to know
    const playerData = new PlayerData(playerName, settings);
    //a master player object to house both
    player = new Player(socket.id, playerConfig, playerData);
    //push the connected player in the players array
    players.push(player); //server use only
    console.log(players);
    playersForUsers.push({ playerData });
    ackCallBack({ orbs, indexInPlayers: playersForUsers.length - 1 }); //send the orbs array as a call Back Acknowledgement
  });

  //The client sent over a "pong"
  socket.on("pong", (data) => {
    //a tock has come in before the player is set up.
    //this is because the client kept tocking after disconnect
    if (!player.playerConfig) {
      return;
    }
    speed = player.playerConfig.speed;
    const xV = (player.playerConfig.xVector = data.xVector);
    const yV = (player.playerConfig.yVector = data.yVector);

    //if player can move in the x, move
    if (
      (player.playerData.locX > 5 && xV < 0) ||
      (player.playerData.locX < settings.worldWidth && xV > 0)
    ) {
      player.playerData.locX += speed * xV;
    }
    //if player can move in the y, move
    if (
      (player.playerData.locY > 5 && yV > 0) ||
      (player.playerData.locY < settings.worldHeight && yV < 0)
    ) {
      player.playerData.locY -= speed * yV;
    }
    //check ponging player to hit orbs
    const capturedOrbI = checkForOrbCollisions(player.playerData,player.playerConfig,orbs,settings);
    //Fuction return null if not collision , an index if there is a collision
    if(capturedOrbI !== null)
    {
      //remove the orb that's needed to be replaced
      orbs.splice(capturedOrbI,1,new Orb(settings));
      //now update the clients with the new orb
      const orbData = {
        capturedOrbI,
        newOrb:orbs[capturedOrbI],
      } 
      //emit to all sockets olaying the game,the orbswitch event so it can update orbs... just the new orb
      io.to('game').emit('orb:switch',orbData);
       //emit to all sockets playing the game, the updateLeaderBoard event because someone just scored
       io.to('game').emit('update:leaderBoard',getLeaderBoard());
    }

    //player collissions of ponging players
    const absorbData = checkForPlayerCollisions(player.playerData,player.playerConfig,players,playersForUsers,socket.id);
    if(absorbData)
    {
      //remove the absorbed Player
      io.to('game').emit('player:absorbed',absorbData);
       //emit to all sockets playing the game, the updateLeaderBoard event because someone just scored
       io.to('game').emit('update:leaderBoard',getLeaderBoard());
    }

  });

  socket.on("diconnect", () => {
    //loop trough players and find the player with THIS PLAYER SOCKET
    //and splice the player out
    for(let i = 0; i < players.length ; i++)
    {
      if(players[i].socketId === player.socketId)
      {
        players.splice(i,1,{});
        playersForUsers.splice(i,1,{});
        break;
      }
    }
    if (players.length === 0) {
      //IF all players leave the room stop "pinging"
      clearInterval(pingPongInterval);
    }
  });
});

//====================================================================

function initGame() {
  //loop 500 times and push a new ORB() onto our array
  for (let i = 0; i < settings.defaultNumberOfOrbs; i++) {
    orbs.push(new Orb(settings));
  }
}

function getLeaderBoard()
{
  const leaderBoardArray = players.map(currPlayer=>{
    return{
      name: currPlayer.playerData?.name,
      score:currPlayer.playerData?.score
    }
  })
  return leaderBoardArray;

}

module.exports = io;
