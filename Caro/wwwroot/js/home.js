let connection = new signalR.HubConnectionBuilder().withUrl("/CaroHub").build();

connection.on("NotifyAllClients", players => {
    let onlineList = $("#online-list");
    let len = players.length;
    for (let i = 0; i < len; i++) {
        onlineList.html("<li>" + players[i] + "</li>");
    }
});

connection.on("NotifyAllRooms", rooms => {
    let roomList = $("#playing-list");
    let len = rooms.length;
    for (let i = 0; i < len; i++) {
        roomList.html("<li>" + rooms[i] + "</li>");
    }
});

connection.on("ExistedPlayerName", () => {
    $("#validate-username").html("Username existed");
});

connection.on("ExistedRoomName", () => {
    $("#validate-room-name").html("Room existed");
});

connection.start().catch(err => console.error(err));

$("#btn-register").click(() => {
    let username = $("#txt-username").val();
    if (username.trim() === "") {
        $("#validate-username").html("Username is invalid");
        return;
    }
    connection.invoke("SomeoneRegister", username);
});

$("#btn-make-room").click(() => {
    let username = $("#txt-username").val();
    if (username.trim() === "") {
        $("#validate-username").html("Username is invalid");
        return;
    }
    let roomName = $("#txt-room-name").val();
    if (roomName.trim() === "") {
        $("#validate-room-name").html("Room name is invalid");
        return;
    }
    connection.invoke("SomeoneCreateRoom", username, roomName);
});