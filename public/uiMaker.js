//set height and width of canvas = window

let wHeight = window.innerHeight;
let wWidth = window.innerWidth;
//Canvas element 
const canvas = document.querySelector('#the-canvas');
//Context is how we draw in 2D
const context = canvas.getContext('2d');

//canvas height and width
canvas.height = wHeight;
canvas.width = wWidth;

//This will be all things for this player
const player = {};
let orbs = [] //this is global variable for orbs list in ui
let players = [] //this is an global array of all Players

//Put the modals into global variables to toggle them when needed
const loginModal = new bootstrap.Modal(document.querySelector('#loginModal'));
const spawnModal = new bootstrap.Modal(document.querySelector('#spawnModal'));




window.addEventListener('load',()=>{
    //on page load  , open the login model
    
    loginModal.show();
})

document.querySelector('.name-form').addEventListener('submit',e=>{
    e.preventDefault();
    // console.log("Submitted! " , e.target.value)
    player.name = document.querySelector('#name-input').value;
    document.querySelector('.player-name').innerHTML = player.name;
    loginModal.hide();
    spawnModal.show();

    console.log(player);
})
document.querySelector('.start-game').addEventListener('click',(e)=>{
    console.log('clicked')
    //hide the spawnModal 
    spawnModal.hide();
    //show the hiddenOnStart things - score and leaderboard
    Array.from(document.querySelectorAll('.hiddenOnStart'))
    .forEach((ele)=>{
        ele.removeAttribute('hidden');
    })
    init();//it's in socket.js
})