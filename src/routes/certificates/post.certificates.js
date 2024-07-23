const { updateBooking } = require('../../controllers/calendars');
const { createCertificate } = require('../../controllers/certificates');
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");

const server = require('express').Router();

const storage = getStorage();

server.post('/uploads', async (req, res) => {
    try {
        const { doctorId, patientId, bookingId } = req.body
        const files = req.files;

        if (doctorId && patientId) {
            const fileUrls = await Promise.all(
                files.map(async (file) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
                    const storageRef = ref(storage, `files/${file.originalname+ "       " +uniqueSuffix}`)

                    // Create file metadata including the content type
                    const metadata = {
                        contentType: file.mimetype,
                    };

                    const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
                    //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

                    // Grab the public url
                    const downloadURL = await getDownloadURL(snapshot.ref);

                    console.log('File successfully uploaded.');

                    const certificate = await createCertificate({ filename: `files/${file.originalname+ "       " +uniqueSuffix}`, name: file.originalname, url: downloadURL, type: file.mimetype, patientId, doctorId });
                  
                    return certificate._id;
                })
            );
            
            
            const certificatesIds = await Promise.all(fileUrls);
            await updateBooking(bookingId, { certificate: certificatesIds })

            return res.status(200).json({
                success: true,
                data: files
            });
        }
 
        return res.status(500).json({
            success: false,
            error: 'DoctorId or PatientId missing'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

server.post('/', async (req, res) => {
    try {
        const files = req.files;

        const fileUrls = await Promise.all(
            files.map(async (file) => {
                const uniqueSuffix = Date.now();
                const fileName = uniqueSuffix + '-' + file.originalname;
                const storageRef = ref(storage, `files/${fileName}`)
                const metadata = { contentType: file.mimetype };
                const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
                const downloadURL = await getDownloadURL(snapshot.ref);

                console.log('File successfully uploaded.');

                return { downloadURL, fileName }
            })
        );
 
        return res.status(200).json({
            success: true,
            data: fileUrls
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = server;
