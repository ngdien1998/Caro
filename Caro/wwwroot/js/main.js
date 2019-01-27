let boardMap;
const boadWidth = 600;
const cellWith = 30;
const lineWidth = 2;
const lineColor = "#BDBDBD";
const offset = 1;
const size = 28;
const X = 2;
const O = 3;

let test1 = [
    { i: -4, j: -4 },
    { i: -3, j: -3 },
    { i: -2, j: -2 },
    { i: -1, j: -1 },
    { i: 0, j: 0 },
    { i: 1, j: 1 },
    { i: 2, j: 2 },
    { i: 3, j: 3 },
    { i: 4, j: 4 }
];

let test2 = [
    { i: -4, j: 4 },
    { i: -3, j: 3 },
    { i: -2, j: 2 },
    { i: -1, j: 1 },
    { i: 0, j: 0 },
    { i: 1, j: -1 },
    { i: 2, j: -2 },
    { i: 3, j: -3 },
    { i: 4, j: -4 }
];

let test3 = [
    { i: -4, j: 0 },
    { i: -3, j: 0 },
    { i: -2, j: 0 },
    { i: -1, j: 0 },
    { i: 0, j: 0 },
    { i: 1, j: 0 },
    { i: 2, j: 0 },
    { i: 3, j: 0 },
    { i: 4, j: 0 }
];

let test4 = [
    { i: 0, j: -4 },
    { i: 0, j: -3 },
    { i: 0, j: -2 },
    { i: 0, j: -1 },
    { i: 0, j: 0 },
    { i: 0, j: 1 },
    { i: 0, j: 2 },
    { i: 0, j: 3 },
    { i: 0, j: 4 }
];

let canvas = document.getElementById("drawing");
let context = canvas.getContext("2d");

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBoad() {
    clearCanvas();
    context.beginPath();
    for (let i = 0; i <= boadWidth; i += cellWith) {
        context.moveTo(0, i + offset);
        context.lineTo(boadWidth, i + offset);
    }

    for (let i = 0; i <= boadWidth; i += cellWith) {
        context.moveTo(i + offset, 0);
        context.lineTo(i + offset, boadWidth);
    }

    context.lineWidth = lineWidth;
    context.strokeStyle = lineColor;
    context.stroke();
    context.closePath();

    for (let i = 4; i < 28; i++) {
        for (let j = 4; j < 28; j++) {
            let mpos = {
                i: i,
                j: j
            };
            let cellContent = boardMap[mpos.i][mpos.j];
            if (cellContent === X) {
                drawX(mpos);
            } else if (cellContent === O) {
                drawO(mpos);
            }
        }
    }
}

function getCursorPosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function checkValidPosision(pos) {
    let x = pos.x, y = pos.y;
    for (let i = 0; i <= boadWidth; i += cellWith) {
        let start = i - 1, end = i + offset + 1;
        if (x >= start && x <= end || y >= start && y <= end) {
            return false;
        }
    }
    return true;
}

function mapBoardPositionToMatrixPosition(bpos) {
    return {
        i: parseInt(bpos.y / cellWith) + 4,
        j: parseInt(bpos.x / cellWith) + 4
    };
}

function mapMatrixPositionToBoardPosition(mpos) {
    return {
        x: (mpos.j - 4) * cellWith,
        y: (mpos.i - 4) * cellWith
    };
}

function drawX(mpos) {
    let bpos = mapMatrixPositionToBoardPosition(mpos);

    context.beginPath();
    context.moveTo(bpos.x + 8 + lineWidth, bpos.y + 8 + lineWidth);
    context.lineTo(bpos.x + 22, bpos.y + 22);
    context.moveTo(bpos.x + 22, bpos.y + 8 + lineWidth);
    context.lineTo(bpos.x + 8 + lineWidth, bpos.y + 22);

    context.lineWidth = 5;
    context.strokeStyle = "red";
    context.lineCap = "round";
    context.stroke();
    context.closePath();
}

function drawO(mpos) {
    let bpos = mapMatrixPositionToBoardPosition(mpos);
    const radius = 8;
    let centerX = bpos.x + 16;
    let centerY = bpos.y + 16;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.lineWidth = 5;
    context.strokeStyle = "green";
    context.stroke();
    context.closePath();
}

function checkGame(originI, originJ, board) {
    let count;
    for (let i = 0; i < 5; i++) {
        count = 0;
        for (let j = i; j < i + 5; j++) {
            if (board[originI + test1[j].i][originJ + test1[j].j] === 2) {
                count++;
            }
        }
        if (count === 5) {
            return true;
        }
    }
    for (let i = 0; i < 5; i++) {
        count = 0;
        for (let j = i; j < i + 5; j++) {
            if (board[originI + test2[j].i][originJ + test2[j].j] === 2) {
                count++;
            }
        }
        if (count === 5) {
            return true;
        }
    }
    for (let i = 0; i < 5; i++) {
        count = 0;
        for (let j = i; j < i + 5; j++) {
            if (board[originI + test3[j].i][originJ + test3[j].j] === 2) {
                count++;
            }
        }
        if (count === 5) {
            return true;
        }
    }
    for (let i = 0; i < 5; i++) {
        count = 0;
        for (let j = i; j < i + 5; j++) {
            if (board[originI + test4[j].i][originJ + test4[j].j] === 2) {
                count++;
            }
        }
        if (count === 5) {
            return true;
        }
    }
    return false;
}

function canvasClick(event) {
    let bpos = getCursorPosition(canvas, event);
    if (!checkValidPosision(bpos)) {
        return;
    }

    let mpos = mapBoardPositionToMatrixPosition(bpos);

    boardMap[mpos.i][mpos.j] = X;
    connection.invoke("PlayerCompletesTurn", boardMap);
    if (checkGame(mpos.i, mpos.j, boardMap)) {
        connection.invoke("IWon", mpos.i, mpos.j, boardMap);
    }
    drawBoad();
    lockBoard();

    let statusHtml = document.getElementById("status");
    statusHtml.innerHTML = "Opponent turn";
    statusHtml.style.color = "red";
}

function lockBoard() {
    canvas.removeEventListener("click", canvasClick);
}

function unlockBoard() {
    canvas.addEventListener("click", canvasClick);
}

let connection = new signalR.HubConnectionBuilder().withUrl("/CaroHub").build();

connection.on("CreateBoard", board => {
    boardMap = board;
    drawBoad();
});

connection.on("UpdateBoardMap", board => {
    boardMap = board;
    drawBoad();
    unlockBoard();

    let statusHtml = document.getElementById("status");
    statusHtml.innerHTML = "Your turn";
    statusHtml.style.color = "green";
});

connection.on("ConfirmApponentWin", (i, j, board) => {
    if (checkGame(i, j, board)) {
        connection.invoke("ApponentWon");
    } else {
        connection.invoke("ApponentDidnotWin", i, j, board);
    }
});

connection.on("YouCheat", () => {
    alert("You cheated");
    lockBoard();
});

connection.on("YouLose", () => {
    alert("You lose");
    let statusHtml = document.getElementById("status");
    statusHtml.innerHTML = "Thua rồi, chơi dở!";
    statusHtml.style.color = "green";
    lockBoard();
});

connection.on("YouWon", () => {
    alert("You won");
    let statusHtml = document.getElementById("status");
    statusHtml.innerHTML = "Thắng rồi!";
    statusHtml.style.color = "green";
    lockBoard();
});

connection.on("StartGameNow", first => {
    if (first === true) {
        alert("Opponent ready! You fisrt. Press OK to play!");
        unlockBoard();
    } else {
        alert("Opponent ready! Opponent fisrt. Press OK to play!");
    }
});

connection.on("WaitForFindingOpponent", () => {
    alert("Please wait for finding opponent");
});

connection.on("UpdatePlayer", players => {
    let playersHtmlElem = document.getElementById("players");
    playersHtmlElem.innerHTML = "";
    let len = players.length;
    for (let i = 0; i < len; i++) {
        let playerHtmlElem = document.createElement("li");
        let innerText = document.createTextNode(players[i]);
        playerHtmlElem.appendChild(innerText);
        playersHtmlElem.appendChild(playerHtmlElem);
    }
});

connection.on("ServerSendMessageToOtherInGroup", (username, message) => {
    let messageHtml = document.createElement("li");
    messageHtml.setAttribute("class", "message");
    messageHtml.setAttribute("id", "their");

    let messageContent = document.createElement("span");
    messageContent.innerHTML = [username, " says <b>", message, "</b>"].join("");

    messageHtml.appendChild(messageContent);

    document.getElementById("room-message").appendChild(messageHtml);
});

connection.on("OpponentGiveUp", () => {
    lockBoard();
    if (confirm("Apponent gave up. You win! Press OK to play with other!")) {
        connection.invoke("ClientRequireNewBoard");
    }
});

connection.start().catch(e => console.error(e));

document.getElementById("btn-register").addEventListener("click", event => {
    let username = document.getElementById("txt-username").value;
    if (username === "") {
        alert("Username is not valid");
        return;
    }
    connection.invoke("SomeoneRegister", username);

    let txtUsername = document.getElementById("txt-username");
    txtUsername.value = "Hello " + txtUsername.value + "!";
    txtUsername.setAttribute("disabled", "");
    document.getElementById("btn-register").setAttribute("disabled", "");
});

document.getElementById("btn-send").addEventListener("click", () => {
    let txtMessage = document.getElementById("txt-message");
    let message = txtMessage.value;
    if (message.trim() === "") {
        alert("Message is not valid");
        return;
    }

    let messageHtml = document.createElement("li");
    messageHtml.setAttribute("class", "message my");

    let messageContent = document.createElement("span");
    messageContent.innerHTML = "You says <b>" + message + "</b>";

    messageHtml.appendChild(messageContent);

    document.getElementById("room-message").appendChild(messageHtml);

    connection.invoke("ClientSendMessage", message);
    txtMessage.value = "";
});