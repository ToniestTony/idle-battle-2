const express = require("express");
const socket = require("socket.io");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Set static folder
app.use(express.static("client"));

// Socket setup
const io = socket(server);

var clients={};

function Client(id){
    this.id=id;
    this.username="Guest"+Math.floor(Math.random()*10000);
    this.color="black";
    this.sockets={};
}

io.on('connection', (socket) => {
	clients[socket.id]=new Client(socket.id);
	console.log('Client connected as '+socket.id+' (clients: '+Object.keys(clients).length+')');
	//Send id
	socket.emit('id',socket.id);
	
	socket.on('chat message', msg => {
		io.emit('chat message', msg);
	});
	
	socket.on("disconnect",function(){
		delete clients[socket.id]
		console.log('Client disconnected as '+socket.id+' (clients: '+Object.keys(clients).length+')');
		socket.broadcast.emit("disconnected",socket.id)
    });
	
	socket.on("invite",function(id){
		socket.to(id).emit("invite",socket.id)
    });
	
	socket.on("cancel",function(id){
		socket.to(id).emit("cancel",socket.id)
    });
	
	socket.on("refused",function(id){
		socket.to(id).emit("refused",socket.id)
    });
	
	socket.on("accept",function(id,time){
		socket.to(id).emit("accept",socket.id,time)
    });
	
	socket.on("delay",function(id,delay){
		socket.to(id).emit("delay",delay)
    });
	
	socket.on("update",function(clientObj){
		socket.broadcast.emit("getData",socket.id,clientObj)
    });
	
	socket.on("upgrade",function(id,money){
		socket.to(id).emit("upgrade",socket.id,money)
	})
	
	socket.on("sabotage",function(id){
		socket.to(id).emit("sabotage",socket.id)
	})
	
	socket.on("steal",function(id,money){
		socket.to(id).emit("steal",socket.id,money)
	})
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
