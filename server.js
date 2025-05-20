const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let shapes = [];
let imageRotation = 0;

// 画像データ（base64）を保持
let currentImageData = null;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('a user connected');

    // 初期描画情報と画像を送る
    socket.emit('initialDraw', shapes);
    socket.emit('rotateImage', imageRotation);
    if (currentImageData) {
        socket.emit('image', currentImageData);
    }

    socket.on('draw', (newShapes) => {
        shapes = newShapes;
        socket.broadcast.emit('draw', shapes);
    });

    socket.on('rotateImage', (angle) => {
        imageRotation = angle;
        socket.broadcast.emit('rotateImage', imageRotation);
    });

    socket.on('getInitialDraw', () => {
        socket.emit('initialDraw', shapes);
        if (currentImageData) {
            socket.emit('image', currentImageData);
        }
    });

    socket.on('image', (imgDataUrl) => {
        currentImageData = imgDataUrl;
        socket.broadcast.emit('image', imgDataUrl);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
