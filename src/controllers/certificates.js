const Certificate = require("../models/certificate");

const findCertificateById = async (certificateId) => {
    try {
        const certificate = await Certificate.findOne({ _id: certificateId });
        if (!certificate) {
            throw new Error('Certificate not found');
        }
        return patient;
    } catch (err) {
        throw new Error('Error fetching certificate by ID');
    }
};

const createCertificate = async (certificateData) => {
    try {
        const { filename, name, url, type, patientId, doctorId } = certificateData;
        return await Certificate.create({
            filename,
            name,
            url,
            type,
            patient: patientId,
            doctor: doctorId
        });
    }catch(err) {
        throw new Error(err.message);
    }
}

module.exports = {
    findCertificateById,
    createCertificate
};