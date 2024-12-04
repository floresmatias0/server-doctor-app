const multer  = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }).array('files', 5);

module.exports = upload;