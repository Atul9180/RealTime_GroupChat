require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const path = require('path')
const helmet = require('helmet')

const sequelize = require('./util/database')
const userRoutes = require('./routes/userRoute')
const chatRoutes = require('./routes/chatRoute')
const groupsRoutes = require('./routes/groupsRoute')

const Users = require('./models/usersModel')
const Chats = require('./models/chatsModel')
const Groups = require('./models/groupsModel')

const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(helmet())


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



sequelize
    // .sync({ force: true })
    .sync()
    .then(response => {
        //console.log(response)
        app.listen(process.env.PORT, () => console.log("Server started running on Port: 3000"))
    }).catch(err => console.log(err))