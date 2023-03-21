const AWS = require("aws-sdk");
let multer = require("multer");

const bucketName = process.env.BUCKET;

const awsConfig = {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETKEYID
};

const S3 = new AWS.S3(awsConfig);



//Specify the multer config
let upload = multer({
    // storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: function (req, file, done) {
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg"
        ) {
            done(null, true);
        } else {
            //prevent the upload
            var newError = new Error("File type is incorrect");
            newError.name = "MulterError";
            done(newError, false);
        }
    },
});




//upload to s3
const uploadToS3 = (fileData) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: bucketName,
            Key: `${Date.now().toString()}.jpg`,
            Body: fileData,
            ACL: 'public-read'
        };
        S3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.log(data);
           // console.log(data.Location);
            return resolve(data);
        });
    });
};


