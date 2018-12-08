// Requiring necessary npm packages
var express = require("express");
var app = express();
var exphbs = require("express-handlebars");
var session = require("express-session");
// Requiring passport as we've configured it
var passport = require("./config/passport");
// Chat
var server = require("http").createServer(app)
var io = require("socket.io").listen(server)
// For image uploads
var multer = require("multer");
var upload = multer({dest: "./uploads"})

// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 8080;
var db = require("./models");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'))
// We need to use sessions to keep track of our user's login status
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

//  Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Chat
io.sockets.on("connection", function(socket){
    var connectedChatUsers = []

    socket.on("new user", function(data){
        socket.username = data
        connectedChatUsers.push(socket.username)
        io.sockets.emit("connected users", connectedChatUsers)
    })

    socket.on("send message", function(data){
        io.sockets.emit("new message", data)
    })

    socket.on("disconnect", function(data){
        connectedChatUsers.splice(connectedChatUsers.indexOf(socket.username), 1)
        io.sockets.emit("connected users", connectedChatUsers)
    })

})

// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Syncing our database and logging a message to the user upon success
db.sequelize.sync().then(function() {
  server.listen(PORT, function() {
    console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
  });
});
