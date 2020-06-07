const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require("socket.io")(http)
const port = process.env.PORT || 3000;

users = {}

// Lobby Id
lobbies = {}
lobbyPasswords = {}
globalLobby = 'Global'
lobbies[globalLobby] = []
readyInformation = {}
readyNumber = {}
lobbyStatus = {}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on("connection", socket => {
    console.log("New User Connection")
    socket.join(globalLobby)
    if (lobbies[globalLobby] == null) {
        lobbies[globalLobby] = []
    }
    lobbies[globalLobby].push(socket.id)
    socket.on('send-chat-message', data=>{
        socket.to(data.lobbyName).emit('chat-message', data)
        console.log(`${data.name} sent ${data.message} to lobby: ${data.lobbyName}`)
    })

    socket.on('new-member', name=>{
        users[socket.id] = name
        socket.to(globalLobby).emit('user-connected', name)
    })

    socket.on('new-name', name=>{
        users[socket.id] = name
    })

    socket.on('disconnect', ()=>{
        leaveLobby(socket.id)
        delete users[socket.id]
        socket.leaveAll()
    })

    socket.on('leave-lobby', lobbyName=>{
        leaveLobby(socket.id)
        socket.leave(lobbyName)
    })

    function leaveLobby(userId){
        const lobbyKeys = Object.keys(lobbies)
        var userIndex
        // Removes user from the Lobby list
        for (var key of lobbyKeys){
            console.log(key)
            userIndex = lobbies[key].indexOf(userId)
            if (userIndex >= 0){
                lobbies[key].splice(userIndex, 1)
                // Also remove ready information about person
                let userReadied = 0
                if (readyInformation[key] != null) {
                    if (readyInformation[key][userId] != null && 
                        readyInformation[key][userId]) {
                        userReadied = 1
                    }
                    delete readyInformation[key][userId]
                    
                }
                if (readyNumber[key] != null) {
                    if (userReadied) {
                        readyNumber[key]--  
                    }
                    console.log("New count for " + key + " is " + readyNumber[key])
                }
                break
            }
        }
        if (lobbies[key].length == 0 && key != globalLobby){
            delete lobbies[key]
        }
        socket.to(key).emit('user-disconnected', users[userId])
        console.log(`${users[userId]} left the lobby: ${key}`)
    }

    //Joining lobbies
    socket.on('check-lobby-exist', (data)=>{
        console.log(`Check lobby exists. Action: ${data.action}`)
        let passwordProtected = data.lobbyName in lobbyPasswords
        if (data.lobbyName in lobbies){
            if (lobbyStatus[data.lobbyName]) {
                console.log('start?')
                data.action = 'started'
            }
            socket.emit('lobby-exists', {lobbyName: data.lobbyName, action: data.action, passwordProtected})
        }
        else{
            socket.emit('lobby-no-exist', {lobbyName: data.lobbyName, action: data.action})
        }
    })

    socket.on('set-lobby-password', data=>{
        console.log(`Set ${data.lobbyName} password to: ${data.password}`)
        lobbyPasswords[data.lobbyName] = data.password
    })

    socket.on('enter-password', data=>{
        console.log(`Entered: ${data.password}, Correct: ${lobbyPasswords[data.lobbyName]}`)
        if (data.password == lobbyPasswords[data.lobbyName]){
            console.log('Password is correct')
            socket.emit('password-correct')
        } else{
            console.log('Password is incorrect')
            socket.emit('password-incorrect')
        }
    })


    socket.on('join-lobby', (data)=>{
        console.log(`${users[socket.id]} Joined ${data.newLobbyName}`)
        userStatus[socket.id] = false
        socket.leave(data.lobbyName)
        // Deleting infomation in lobbies and readyInformation for old lobby
        userIndex = lobbies[data.lobbyName].indexOf(socket.id)
        if (userIndex >= 0) {
            lobbies[data.lobbyName].splice(userIndex, 1)
        } 
        if (!(data.newLobbyName in lobbies)){
            lobbies[data.newLobbyName] = []
            lobbyStatus[data.newLobbyName] = false
        }
        lobbies[data.newLobbyName].push(socket.id)
        socket.join(data.newLobbyName)
        socket.to(data.newLobbyName).emit('user-joined-lobby', users[socket.id])
        userChainedData[socket.id] = []
        userTotalData[socket.id] = []
        if (readyInformation[data.newLobbyName] == null) {
            readyInformation[data.newLobbyName] = {}
            readyInformation[data.newLobbyName][socket.id] = false
            readyNumber[data.newLobbyName] = 0
            console.log("Initialized information about " + data.newLobbyName)
        } else {
            readyInformation[data.newLobbyName][socket.id] = false
        }
        
    })

    // Current Members
    socket.on('get-lobby-members', lobbyName=>{
        //var lobbyInfo = io.sockets.adapter.rooms[lobbyName]
        var names = []
        let number = 0
        //var userIds = Object.keys(lobbyInfo.sockets)
        if (lobbies[lobbyName] != null) {
            number = lobbies[lobbyName].length
        }
        for (var i = 0; i < number ; i++){
            if (i < lobbies[lobbyName].length - 1){
                userNextPlayer[lobbies[lobbyName][i]] = lobbies[lobbyName][i+1]
            }
            else{
                userNextPlayer[lobbies[lobbyName][i]] = lobbies[lobbyName][0]
            }
            names.push(users[lobbies[lobbyName][i]])
        }
        io.in(lobbyName).emit('current-lobby-members', names)
         
    })


    socket.on('get-numbers', name=>{
        let saveNum = 0
        if (lobbies[name] != null) {
            saveNum = lobbies[name].length
        }
        returnObj = {readied: readyNumber[name], members: saveNum}
        socket.emit('get-number-return', returnObj)

    })


    // Start Game
    // We can maybe collapse these down later on...
    userNextPlayer = {} // stores key: player id, value: next player id
    userCurrentData = {} // stores key: player id, value: current drawing/guessed word
    userPreviousData = {} // stores key: player id, value: word if no one wrote anything
    tempPreviousData = {} // stores key: player id, value: word if no one wrote anything (but inbetween rounds)
    userTotalData = {} // stores key: player id, value: previous drawings/guessed words
    userChainedData = {} // stores key:player id, value: chain of drawings and guessed words
    userStatus = {} // stores key: player id, value: boolean if done task
    socket.on('start-game', lobbyName=>{
        io.in(lobbyName).emit('game-starting')
        console.log(`Game starting in ${lobbyName}`)
        lobbyStatus[lobbyName] = true
        
        // Resetting the ready/totalData information
        readyNumber[lobbyName] = 0
        for (let player of lobbies[lobbyName]){
            readyInformation[lobbyName][player] = false
            userTotalData[player] = []
        }

        /*
        let number = 0
        if (lobbies[lobbyName] != null) {
            number = lobbies[lobbyName].length
        }
        for (let i = 0; i < number; i++) {
            let userId = lobbies[lobbyName][i]
            userTotalData[userId] = []
            
        }
        */
    })

    socket.on('finished-game', lobbyName=>{
        lobbyStatus[lobbyName] = false
    })

    socket.on('finished-event', data=>{
        console.log(`${users[socket.id]} finished ${data.event}`)
        var everybodyDone = true
        userStatus[socket.id] = true
        for (var userId of lobbies[data.lobbyName]){
            if (userStatus[userId] == false){
                everybodyDone = false
                break
            }
        }
        if (everybodyDone){
            console.log(`Everyone is done ${data.event}`)
            var nextEvent = ''
            if (userTotalData[socket.id].length >= lobbies[data.lobbyName].length){
                compute_chain(data.lobbyName)
                nextEvent = 'game-finished'
            }
            else if (data.event == 'drawing'){
                nextEvent = 'start-guessing'
            }
            else if (data.event == 'picking-word'){
                if (readyNumber[data.lobbyName] == lobbies[data.lobbyName].length){
                    nextEvent = 'start-drawing'
                    let number = 0
                    if (lobbies[data.lobbyName] != null) {
                        number = lobbies[data.lobbyName].length
                    }
                    for (let i = 0; i < number; i++){
                        let userId = lobbies[data.lobbyName][i]
                        userPreviousData[userId] = tempPreviousData[userId]
                        tempPreviousData[userId] = ''
                    }
                }
            }
            else if (data.event == 'guessing'){
                nextEvent = 'start-drawing'
                let number = 0
                if (lobbies[data.lobbyName] != null) {
                    number = lobbies[data.lobbyName].length
                }
                for (let i = 0; i < number; i++){
                    let userId = lobbies[data.lobbyName][i]
                    userPreviousData[userId] = tempPreviousData[userId]
                    tempPreviousData[userId] = ''
                }
            }
            else{}
            console.log(`Everyone is ${nextEvent}`)        

            if (nextEvent == 'game-finished'){
                let allChainedData = []
                let allPlayerList = []
                for (var userId of lobbies[data.lobbyName]){
                    allChainedData.push(userChainedData[userId])
                    allPlayerList.push(users[userId])
                    userStatus[userId] = false
                }
                io.in(data.lobbyName).emit('game-finished', {allChainedData, allPlayerList})
            }
            else{
                for (var userId of lobbies[data.lobbyName]){
                    let senderObj = {reciever: userId, eventName: nextEvent, curWord: userCurrentData[userId]}
                    io.in(data.lobbyName).emit('next-match', senderObj)
                    userStatus[userId] = false
                }
            }
        }
        
    })

    socket.on('ready-up', (sender)=> {
        console.log("Player Attempting to Ready")
        if (readyInformation[sender.lobby][sender.userId] == null || 
            !readyInformation[sender.lobby][sender.userId]) {
            readyInformation[sender.lobby][sender.userId] = true
            readyNumber[sender.lobby]++
            io.in(sender.lobby).emit('someone-readied')
        }
    })

    // Call this function when the round is over and 
    // userTotalData[] is full so that it can accurately 
    // create userChainedData
    function compute_chain(lobbyName) {
        let number = 0
        if (lobbies[lobbyName] != null) {
            number = lobbies[lobbyName].length
        }
        for (let i = 0; i < number; i++) {
          let index = 0
          let initialId = lobbies[lobbyName][i]
          let userId = lobbies[lobbyName][i]
          do {
              userChainedData[initialId].push(userTotalData[userId][index])
              userId = userNextPlayer[userId]
              index++
          } while(userId != initialId);
        }
    }


    /*
    socket.on('ready-down', (sender)=> {
        console.log("Player Attempting to Unready")
        if (readyInformation[sender.lobby][sender.userId] == null ||
            !readyInformation[sender.lobby][sender.userId]) {
                console.log("Warning: Code should not be going here")
                console.log("Server is attempting to unready a player that isn't ready")
        }
        else {
            readyInformation[sender.lobby][sender.userId] = false
            readyNumber[sender.lobby]--
            io.in(sender.lobby).emit('someone-readied')   
        }
    })
*/

    // Determines if a given lobby should start
    socket.on('should-start', (lobbyName)=> {
        console.log("Determining if " + lobbyName + " should start")
        console.log(`${readyNumber[lobbyName]} ready of ${lobbies[lobbyName].length}`)
        if (readyInformation[lobbyName] != null && readyNumber[lobbyName] != null) {
            if (readyNumber[lobbyName] == lobbies[lobbyName].length) {
                socket.emit('should-start-return', true)
            } else {
                socket.emit('should-start-return', false)
            }
        }
    })

    // The reason this function exists is because i need to call 
    // the code from 'guessed-word' and 'getsend-prev-data'



    

    socket.on('getsend-prev-data', userId =>{
        console.log(userId +" Attempting to get previous data " + userPreviousData[userId])
        doGuess(wordScramble(userPreviousData[userId]))
    })



http.listen(port, () => {
    console.log('Listening on port: ', + port);
})
