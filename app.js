const { time } = require("console");
const express   = require("express")
const app       = express();
const http      = require("http");
const server    = http.createServer(app);
const io        = require('socket.io')(server);

const LISTEN_PORT       = 8080;
const ABS_STATIC_PATH   =__dirname + '/public';

//constants that may need to be moved to another file
//available game states
const GAME_STATES = {
    waiting: "waiting",
    modeSelection: "modeSelection",
    instructions: "instructions",
    playing: "playing",
    gameEnd: "gameEnd"
}

const MAX_PLAYERS = 2;
const MAX_HORIZONTAL_DIST = 4;
const MIN_HORIZONTAL_DIST = -4;
const MAX_TIME = 3000/8;

const PLAYING_ROOM = "playingRoom";


const playersData = [];
let currGameState = GAME_STATES.waiting;
let currMode = "";
let timeLeft = 40;
let planeYPos = 1.6;



app.get('/', function (req, res) {
    res.sendFile('index.html', {root:ABS_STATIC_PATH});
});

//socket.io stuff
//https://socket.io/docs/v3/emit-cheatsheet/
io.on('connection', (socket) => {
    console.log( socket.id + "connected" );

    //when a new client connects send them the current number of players on the server
    socket.emit("starter_data", {socketId: socket.id, players: playersData});

    socket.on('disconnect', () => {
        //remove the player from players if they are a valid player when they disconnect
        if(playersData.find(player => player.playerId === socket.id))
        {
            const userIndex = playersData.findIndex(item => item.playerId == socket.id);
            playersData.splice(userIndex, 1);
            if(playersData.length > 0)
            {
                playersData[0].isLeadPlayer = true;
                currGameState = GAME_STATES.waiting;
                planeYPos = 1.6;
                emitGameStateEvents();
            }
        }
        
            
        //if the remaining user is not a lead player, make them a lead player
    });

    //socket receives the player data such as device type, and if the player is a lead
    socket.on('player_ready', (data) => {   
        playersData.push({playerId: socket.id,
                          isLeadPlayer: playersData.length === 0,
                          device: data.device,
                          playerContinue: false,
                          score: 0
        });

        //valid players are sent to the playing room
        socket.join(PLAYING_ROOM);
        
        //update the game state if two valid players are playing
        if(playersData.length === MAX_PLAYERS) {
            currGameState = GAME_STATES.modeSelection;
            //emit a game state event to the client
            emitGameStateEvents();
        }
    })

    //socket listens for when a mode has been selected
    socket.on('mode_selected', (data) => {
        currMode = data;
        currGameState = GAME_STATES.instructions;
        emitGameStateEvents();
    })

    //socket listens for when a player is ready to continue (is done reading the instructions)
    socket.on('player_continue', (data) => {
        const playerIndex = playersData.findIndex(item => item.playerId === socket.id);
        playersData[playerIndex].playerContinue = true;

        let numPlayersContinue = 0;
        playersData.forEach(player => {if (player.playerContinue) numPlayersContinue++});
        //if both players are ready to continue
        if (numPlayersContinue === MAX_PLAYERS)
        {
            for(let i=0; i<playersData.length; i++){
                console.log(playersData[i])
                playersData[i].playerContinue = false;
            }
            currGameState = GAME_STATES.playing;
            emitGameStateEvents();
        }
    })

    //socket 
    socket.on('x_rotation_update', (data) => {
        // get the id of the player who didn't emit this event
        if(currGameState === GAME_STATES.playing)
        {
            const playerIndex = playersData.findIndex(player => player.playerId != socket.id);
            const playerID = playersData[playerIndex].playerId;
            io.to(playerID).emit('plane_update', {mode: currMode, planeXRotation: data.planeXRotation, planeYPosFactor: data.planeYPosFactor});
        }
        })

    
    socket.on('move_right', (data) => {
        io.to(PLAYING_ROOM).emit('move_towards_point', {dir: "right", mode: currMode})
    })


    socket.on('move_left', (data) => {
        io.to(PLAYING_ROOM).emit('move_towards_point', {dir: "left", mode: currMode})
    })


    socket.on('stop_horizontal_movement', (data) => {
        io.to(PLAYING_ROOM).emit('stop_horizontal')
    })

    //listens for an update in score
    socket.on('score', (data) => {
        if(currGameState === GAME_STATES.playing) {
            const playerIndex = playersData.findIndex(player => player.playerId != socket.id);
            const playerID = playersData[playerIndex].playerId;
            io.to(playerID).emit('score_update', {score: data.score, gameMode: currMode});
        }
    })
    

});

server.listen(LISTEN_PORT);
app.use(express.static(__dirname + '/public'));

console.log("Listening on port: " + LISTEN_PORT);

//function emits events to the clients in the playing room based on the current game state
const emitGameStateEvents = function() {

    //getting id of the lead player
    const leadPlayerIndex = playersData.findIndex(player => player.isLeadPlayer)

    switch (currGameState) {
        //emit the waiting event with the ID of the lead player
        case GAME_STATES.waiting:
            io.to(PLAYING_ROOM).emit("waiting", playersData[leadPlayerIndex].playerId);
            break;
        //emit the mode selection event with the ID of the lead player
        case GAME_STATES.modeSelection:
            io.to(PLAYING_ROOM).emit("mode_selection", playersData[leadPlayerIndex].playerId);
            break;
        //emit the instructions event with the selected mode
        case GAME_STATES.instructions:
            io.to(PLAYING_ROOM).emit("instructions", {mode: currMode});
            break;
        //emit the playing event with the selected mode
        case GAME_STATES.playing:
            io.to(PLAYING_ROOM).emit("playing", {mode: currMode, timeLeft: 20});
            //code reference: https://stackoverflow.com/questions/29311311/how-do-i-take-away-from-a-variable-a-certain-number-of-times-every-second-javasc/29311357
            let secondsPassed = 0;
            const intervalId = setInterval(function() {
                    secondsPassed += 1;
                    //when timer is up, end the game
                    if(timeLeft === 0) {
                        clearInterval(intervalId);
                        timeLeft = 40;
                        currGameState = GAME_STATES.gameEnd;
                        emitGameStateEvents();
                    }
                    else if (currGameState === GAME_STATES.waiting)
                    {
                        clearInterval(intervalId);
                        timeLeft = 40;
                    }
                    else {
                        timeLeft--;
                        io.to(PLAYING_ROOM).emit('time_update', {timeLeft: timeLeft});
                    }

                    //send obstacle ring coordinates
                    if(secondsPassed === 5)
                    {
                        secondsPassed = 0;
                        if(currMode === "competitive")
                            io.to(PLAYING_ROOM).emit('generate_obstacle', {mobileObstacles: {x:0, y:Math.floor(Math.random() * 9 - 5), z:-50},
                                                                           desktopObstacles: {x: Math.floor(Math.random() * 9 - 5), y:0, z:-50}
                        })
                        else
                            io.to(PLAYING_ROOM).emit('generate_obstacle', {x: Math.floor(Math.random() * 9 - 5), y:Math.floor(Math.random() * 9 - 5), z:-50})
                    }

                }, 1000)
            break;
        //emit the playing event with the selected mode
        case GAME_STATES.gameEnd:
            io.to(PLAYING_ROOM).emit('game_end', playersData[leadPlayerIndex].playerId);
            break;
        default:
            break;
    }

        
}