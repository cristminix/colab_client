//client.js
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
var cors = require('cors');
var fs = require('fs');
global.Buffer = global.Buffer || require('buffer').Buffer;

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str, 'binary').toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString('binary');
  };
}
// const { initializeRoutes } = require("./routes");

var io_client = require('socket.io-client');

var url = 'http://ace9-34-68-108-76.ngrok.io'
fs.readFile('host.json', 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    var obj = JSON.parse(data); //now
    url = obj.host

    console.log(`set url ${url}`)
}});
var s_client;

function change_host(host){
    console.log(`host changed:${host}`)
    url = host;
    var data = {host}
    fs.writeFile ("host.json", JSON.stringify(data), function(err) {
        if (err) throw err;
        console.log('complete');
        }
    );

    s_client = io_client.connect(url, {
        extraHeaders: {
            // Authorization: "Bearer authorization_token_here"
            'ngrok-skip-browser-warning':1
        },
        reconnect: true
    });

    // Add a connect listener
    s_client.on('connect', function (socket) {
        console.log('Connected!');
    });
    s_client.emit('reply', 'Halo nama saya budi');
}


let app = express();
// 
const port = 8000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app = initializeRoutes(app);
app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "welcome to the beginning of greatness",
  });
});

app.get("/setHost", (req, res) => {
  var host = atob(req.query.url);
  change_host(host);
  res.status(200).send({
    success: true,
    host : host,
    message: "welcome to the beginning of greatness",
  });
});
app.get("/proxy", (req, res) => {
  var path =req.query.path;
  fetch(`${url}/${path}`).then((e)=>{return e.json()}).then((e)=>{
    console.log(e)
  res.status(200).send(e);

})

});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
  },
});

io.on("connection", (s) => {
  console.log("We are live and connected");
  console.log(s.id);
  s.on('notice', function (from, msg) {
    console.log('MSG', from, ' saying ', msg);
  });
});

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});