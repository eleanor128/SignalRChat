var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

// 連線至 SignalR Hub
connection.start().then(() => {
    console.log("SignalR connection established");

    // 連線成功後，發送初始位置
    connection.invoke("SendPlayerPosition", player.x, player.y).catch((err) => {
        console.error("Error sending initial player position:", err.toString());
    });

}).catch((err) => {
    console.error("Error connecting to SignalR:", err.toString());
});

// 取得 canvas 元素
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 畫布尺寸
const canvasWidth = 500;
const canvasHeight = 500;

// 方塊的初始位置 (隨機生成)
let player = {
    x: Math.floor(Math.random() * (canvasWidth - 20)), // 隨機 x 坐標，減去方塊的寬度 20，避免超出畫布
    y: Math.floor(Math.random() * (canvasHeight - 20)), // 隨機 y 坐標，減去方塊的高度 20，避免超出畫布
    size: 20,
    color: "blue"
};

// 繪製方塊
function drawPlayer() {
    console.log("Drawing player at:", player.x, player.y); // 確認位置是否更新
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除畫布
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

// 當方塊移動時，發送新的位置給其他使用者
function movePlayer(event) {
    const step = 5; // 方塊每次移動的距離
    switch (event.key) {
        case "ArrowUp":
            player.y -= step;
            break;
        case "ArrowDown":
            player.y += step;
            break;
        case "ArrowLeft":
            player.x -= step;
            break;
        case "ArrowRight":
            player.x += step;
            break;
    }

    // 發送位置給其他使用者
    connection.invoke("SendPlayerPosition", player.x, player.y).catch(function (err) {
        return console.error(err.toString());
    });

    drawPlayer(); // 更新畫布
}

// 監聽其他使用者的方塊移動
connection.on("ReceivePlayerPosition", function (x, y) {
    console.log("Received position: ", x, y); // 確認是否收到正確的位置
    player.x = x;
    player.y = y;
    drawPlayer();
});

// 監聽鍵盤事件
document.addEventListener("keydown", movePlayer);

// 初次載入時就繪製隨機位置的方塊
drawPlayer();
