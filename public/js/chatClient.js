$(document).ready(function() {
    // This file just does a GET request to figure out which user is logged in
    // and updates the HTML on the page
    $.get("/api/user_data").then(function(data) {
        username = data.username
        socket.emit("new user", username)
    });
  
    var origin = window.location.origin
    var socket = io.connect(origin)
    var $messageBox = $("#message")
    var $send = $("#send")
    var $chat = $("#chat")
    var $users = $("#users")
  
    $send.on("click", function(event){
        event.preventDefault()
        var chatMsg = { username: username, message: $messageBox.val()}
        socket.emit("send message", chatMsg)
        $messageBox.val("")
    })

    socket.on("connected users", function(data){
        $users.empty()
        data.forEach(function(name){
            var userCard = $("<a>");
            userCard.attr("href", "/members/" + name)
            userCard.text(name)
            userCard.append($("<br>"))
            // console.log(userCard)
            $users.append(userCard)
        })
    })
  
    socket.on("new message", function(data){
        $chat.append("<p><strong>" + data.username + ": </strong>" + data.message + "<br></p>")
    })
  
  });
  