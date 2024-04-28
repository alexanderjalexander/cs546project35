import {ObjectId} from "mongodb";
import * as path from "node:path";

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'server_images/')
    },
    filename: function (req, file, cb) {
        const uniquePrefix = new ObjectId().toString();
        cb(null, uniquePrefix + '_' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (mimeType && extName) {
        cb(null, true);
    } else {
        return cb(new TypeError('Only image files are allowed!'));
    }
}

const multerConfig = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: (4*1024*1024)
    }
})

export {multerConfig};