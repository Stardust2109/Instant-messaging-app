const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const cors = require('cors');

const cookieParser = require('cookie-parser');

const UserModel = require('./models/UserModel');
const Messages = require('./models/Messages');
const ws = require('ws');

const port = process.env.PORT ? 'wss://instant-messaging-app-backend.onrender.com'|| 4040;

mongoose.connect(process.env.MONGO_URL);
const app = express();

const fs = require('fs');
const apiBaseUrl = process.env.CLIENT_URL || 
                   (env.MODE === 'production' 
                   ? 'https://instant-messaging-app-backend.onrender.com' 
                   : 'http://localhost:4040');

app.use(express.json());
app.use(cookieParser());

app.use('/Attachments', express.static(__dirname + '/Attachments'));

app.use(cors({
    credentials: true,
    origin: 'https://instant-messaging-app-frontend.onrender.com',
}));


async function getUserData(req) {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token;
        if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) throw err;
                resolve(userData);
            });
        }
        else{
            reject('No token found');
        }
    });

}

app.get('/messages/:userId', async (req, res) => {
    const { userId} = req.params;
    const userDataFromReq =  await getUserData(req);
    const userId_sen = userDataFromReq.userId;
    
    const userMessages = await Messages.find({
        sender: {$in:[userId, userId_sen]},
        recipient:{$in:[userId_sen, userId]},
    }).sort({createdAt:1}).exec();

    res.json(userMessages);
});

app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);
        });
    }
    else {
        res.status(401).json("No token found");
    }
});

app.get('/test', (req, res) => {
    res.json("Test OK");
});

app.get('/people', async (req, res)=>{
    const users = await UserModel.find({}, {'_id':1, username: 1});
    res.json(users);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await UserModel.findOne({ username: username, password: password });
    if (foundUser) {
        jwt.sign({ userId: foundUser._id, username }, jwtSecret, {}, (err, token) => {
            res.cookie('token', token, { sameSite: 'none', secure: true }).json({
                id: foundUser._id,
            });

        });
    }
});

app.post('/logout', (req, res)=>{
    res.cookie('token', '', { sameSite: 'none', secure: true }).json('Ok');
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = await UserModel.create({ username, password });
        jwt.sign({ userId: newUser._id, username }, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({
                id: newUser._id,
            });
        });
    }
    catch (err) {
        if (err) throw err;
        res.status(500).json("An error was encountered");
    }

});

const server = app.listen(port);
//655WPuy72mr4wihH

const wss = new ws.WebSocketServer({ server });
wss.on('connection', (connection, req) => {

    function notifyAboutOnline(){
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify({
                onlineUsers: [...wss.clients].map(cl => ({ userId: cl.userId, username: cl.username }))
            }
    
            ));
        });
    }

    connection.isAlive = true;

    connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(()=>{
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyAboutOnline();
        }, 1000);
    }, 5000);

    connection.on('pong', () =>{
        clearTimeout(connection.deathTimer);
    }); 


    const cookies = req.headers.cookie;
    if (cookies) {
        const cookieStrings = cookies.split(';').find(str => str.startsWith('token='));
        // console.log(cookieStrings);
        if (cookieStrings) {
            const token = cookieStrings.split('=')[1];
            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err) throw err;
                    const { userId, username } = userData;

                    connection.userId = userId;
                    connection.username = username;

                })
            }
        }
    }
    
    // connection.send("Hello");
    // Notify everyone about online people when someone connects --> UNderstand!

    connection.on("message", async (message) => {
        const textMessage = JSON.parse(message.toString());
        const { recipient, text, file } = textMessage;
        let file_name = null;
        if(file){
            const nameParts = file.name.split('.');
            const fileExt = nameParts[nameParts.length - 1];
            file_name = Date.now() + '.' + fileExt;
            file_path = __dirname + '/Attachments/' + file_name;
            
            const bufferData = Buffer.from(file.data.split(',')[1], 'base64');
            fs.writeFile(file_path, bufferData, () =>{
                console.log('File saved succesfully: ' + file_path);
            })
        }
        if (recipient && (text || file)) {
            const messageDoc = await Messages.create({
                sender: connection.userId,
                recipient,
                text,
                file: file ? file_name : null
            });

            // console.log('Created message');

            [...wss.clients]
                .filter(c => c.userId === recipient)
                .forEach(c =>
                    c.send(JSON.stringify({
                        text,
                        sender: connection.userId,
                        recipient,
                        file: file ? file_name : null,
                        _id: messageDoc._id,
                    })));
        }
    });

    notifyAboutOnline();

    
});

