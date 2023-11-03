const path = require('path');
const multer  = require('multer');

const storage = multer.diskStorage({
	destination: path.join(__dirname, '../../uploads/'),
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null,  uniqueSuffix + '-' + file.originalname)
	}
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no válido'), false);
    }
};

const upload = multer({ storage, fileFilter }).array('files', 2);

module.exports = upload;