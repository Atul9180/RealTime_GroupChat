const Users = require('../models/usersModel')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//@desc: Generate Token
function generateToken(email, name, userId) {
    return (jwt.sign({ email, name, userId }, process.env.JWT_SECRETKEY))
}


//@desc: Sign up
exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const [newUser, created] = await Users.findOrCreate({
            where: { email },
            defaults: { name, phone, password: await bcrypt.hash(password, saltRounds) },
        });
        if (!created) {
            return res.status(409).json({
                message: "Email id already exists. Please Login or change the Email id.",
            });
        }
        return res.status(201).json({
            message: "Successfuly created new user.!",
            //user: newUser,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


//@desc: Sign in
exports.signUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ where: { email } })
        if (user === null || user === '' || user === undefined) {
            return res.status(404).json({ message: "User not found" });
        }
        else {
            const pswdMatched = await bcrypt.compare(password, user.password)
            if (pswdMatched) {
                return res.status(200).json({ success: true, message: "User logged in successfully", token: generateToken(email, user.name, user.id), userId: user.id });
            }
            else {
                return res.status(401).json({ message: "Incorrect Password user not Authorized." });
            }
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ err });
    }
}


//@desc: Get Users (id and name)
exports.getUsers = async (req, res) => {
    //console.log({ token: req })
    try {
        const users = await Users.findAll();
        if (!users) {
            return res.status(404).send({ error: 'No users found' });
        }
        const data = users.map(user => ({ id: user.id, name: user.name }));
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
    }
};