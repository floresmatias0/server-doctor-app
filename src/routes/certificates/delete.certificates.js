const { getStorage, ref, deleteObject } = require("firebase/storage");

const server = require('express').Router();

const storage = getStorage();

server.post('/file/delete', async (req, res) => {
    try {
        const { body } = req;

        const desertRef = ref(storage, `files/${body?.file?.fileName}`);

        const response = await deleteObject(desertRef);

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;