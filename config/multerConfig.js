import {ObjectId} from "mongodb";
import * as path from "node:path";

const multer = require('multer');

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        const uniqueSuffix = new ObjectId().toString();
        cb(null, file.originalname + '_' + uniqueSuffix)
    }
})

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (mimeType && extName) {
        cb(null, true);
    } else {
        cb("Error: You can Only Upload Images!!");
    }

    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg') {
        req.fileValidationError = 'Incorrect image type.';
        cb(new Error('goes wrong on the mimetype'));
    }
}

const upload = multer({
    dest: 'server_images/',
    storage,
    fileFilter,
    fileSize: (4*1024*1024)
})

export {upload};