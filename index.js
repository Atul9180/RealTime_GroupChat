require('dotenv').config();
const express = require('express')
const cors = require('cors');
const app = express();
const sequelize = require('./util/database')
const server = require("http").createServer(app);
const { setupSocketServer } = require('./util/socket');
const { job } = require('./services/cronJob');
const path = require('path');
const helmet = require('helmet');
app.use(helmet());




setupSocketServer(server);
const userRoutes = require('./routes/userRoute')
const chatRoutes = require('./routes/chatRoute')
const groupsRoutes = require('./routes/groupsRoute')

const Users = require('./models/usersModel')
const Chats = require('./models/chatsModel')
const Groups = require('./models/groupsModel')


app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));


//@desc: Middlewares-
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));



//@desc: routes-
app.use(userRoutes)
app.use(chatRoutes)
app.use(groupsRoutes)


app.use('/', (req, res) => { res.sendFile(path.join(__dirname, '/public/index.html')) })


Users.hasMany(Chats)
Chats.belongsTo(Users)

Users.hasMany(Groups)
Groups.belongsTo(Users)

Groups.hasMany(Chats)
Chats.belongsTo(Groups)


//@desc: cron job:
job.start();


sequelize
    // .sync({ force: true })
    .sync()
    .then(() => {
        server.listen(process.env.PORT, () => console.log("Server started running on Port: 3000"))
    }).catch(err => console.log(err))