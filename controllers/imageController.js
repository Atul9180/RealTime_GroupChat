const Chats = require('../models/chatsModel');
const multer = require('multer');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.IAM_USER_ACCESS,
    secretAccessKey: process.env.IAM_USER_SECRET
});

// Multer for handling 
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
}).single('image');



//@desc: upload single image
const uploadImage = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) {
                    console.error(err);
                    reject(new Error('Error uploading image'));
                } else {
                    resolve();
                }
            });
        });

        // Upload the image to S3
        const image = req.file;
        const key = `images/${Date.now()}_${image.originalname}`;
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            Body: image.buffer,
            ACL: 'public-read'
        };
        const s3Response = await s3.upload(params).promise();

        // Return the S3 URL to the client
        const url = s3Response.Location;
        const chat = await Chats.create({
            name: req.user.name,
            message: url,
            userId: req.user.id,
            groupId: req.query.groupId
        });

        res.status(201).send(chat);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

module.exports = {
    uploadImage,
};