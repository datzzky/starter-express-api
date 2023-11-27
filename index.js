const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = require('./Routes/router');
const adminRouter = require('./Routes/adminRoutes');
const localtunnel = require('localtunnel');

const PORT = 4040;
const app = express();
const db_URI = 'mongodb://127.0.0.1:27017/BoardingGo';
mongoose.connect(db_URI, {})
    .then((result) => console.log(`connected to the DB with result: ${{ result }}`))
    .catch((err) => console.log(`unable to connect to DB with error: ${err}`));

// const db_URI = 'mongodb+srv://datzzky:UMRMiHrZ9ZXvWUce@demo.j1rvpm2.mongodb.net/BoardingGo?retryWrites=true&w=majority';
// mongoose.connect(db_URI,{useNewUrlParser: true, useUnifiedTopology: true})
// .then((result) => console.log(`connected to the DB with result: ${{result}}`))
// .catch((err) => console.log(`unable to connect to DB with error: ${err}`));

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.use(adminRouter);

// (async () => {
//     const tunnel = await localtunnel({ port: 3000 });
  
//     // the assigned public url for your tunnel
//     // i.e. https://abcdefgjhij.localtunnel.me
//     tunnel.url;
  
//     tunnel.on('close', () => {
//       // tunnels are closed
//     });
//   })();


const server = app.listen(PORT, console.log(`Running on port ${PORT}`));


const io = require('socket.io')(server, {
    pingTimeOut: 60000,
    cors: {
        // Allow connections from both localhost and the second origin
        origins: ["http://localhost:5173", "https://united-rarely-husky.ngrok-free.app"],
    }
});
io.on("connection", (socket) => {
    console.log("User is connected");

    socket.on("chat", (payload) => {
        console.log("Received chat message: ", payload);
        io.emit("chat", payload);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


// UMRMiHrZ9ZXvWUce userPassword for mongodb