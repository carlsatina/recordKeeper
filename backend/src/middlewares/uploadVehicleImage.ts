import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        const targetPath = process.env.NODE_ENV === 'development'
            ? path.join(__dirname, '../../uploaded-images/vehicles')
            : path.join(__dirname, '../../../uploaded-images/vehicles')
        callback(null, targetPath)
    },
    filename: function(req, file, callback) {
        callback(null, `${Date.now()}-${file.originalname}`)
    }
})

const fileFilter = (req: any, file: any, cb: any) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/webp'
    ) {
        cb(null, true)
    } else {
        cb('Not an image! Please upload an image', false)
    }
}

const uploadVehicleImage = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1
    },
    fileFilter
})

export default uploadVehicleImage
