//connect to socket server
const socket= io.connect('http://localhost:8001');

// this is called inside of start-game listenner
const init = async() => {
    const initData = await socket.emitWithAck('init:send',{
        playerName:player.name
    })
    //our await has resolved, so start "ponging"
    setInterval(async()=>{
        socket.emit('pong',{
            xVector: player.xVector ? player.xVector : .1,
            yVector: player.yVector ? player.yVector : .1,
        })
    },33)
    // console.log(initData.orbs);
    orbs = initData.orbs; 
    player.indexInPlayers = initData.indexInPlayers;   
    draw(); //draw function is in canvasStuff
}

//the server sends out the location/data of all players 30/second
socket.on('ping',(playersArray)=>{
    // console.log(players)
    players = playersArray;
    if(players[player.indexInPlayers].playerData){
        player.locX = players[player.indexInPlayers].playerData.locX
        player.locY = players[player.indexInPlayers].playerData.locY
    }
})

//if any orbs get absorbed , server will replace that orb in th orbs array
socket.on('orb:switch',orbData=>{
    orbs.splice(orbData.capturedOrbI,1,orbData.newOrb);
})
socket.on('player:absorbed', absorbData=>{
    document.querySelector('#game-message').innerHTML = `${absorbData.absorbed} was absorbed by ${absorbData.absorbedBy}`
    document.querySelector('#game-message').style.opacity = 1;
    window.setTimeout(()=>{
        document.querySelector('#game-message').style.opacity = 0;
    },2000)
})
socket.on('update:leaderBoard',leaderBoardArray=>{
    // console.log(leaderBoardArray)
    leaderBoardArray.sort((a,b)=>{
        return b.score - a.score;
    })
    document.querySelector('.leader-board').innerHTML = "";
    leaderBoardArray.forEach(p=>{
        if(!p.name){
            return;
        }
        document.querySelector('.leader-board').innerHTML += `
            <li class="leaderboard-player">${p.name} - ${p.score}</li>
        `
    })
    const el = leaderBoardArray.find(u=>u.name === player.name)
    document.querySelector('.player-score').innerHTML = el.score
})