const Patient = require("../models/patient");

const findAllPatients = async (filters) => {
    try {
        return await Patient.find(filters);
    }catch(err) {
        throw new Error(err.message);
    }
};

const findPatientById = async (patientId) => {
    try {
        const patient = await Patient.findOne({_id: patientId});
        if (!patient) {
            throw new Error('Patient not found');
        }
        return patient;
    } catch (err) {
        throw new Error('Error fetching patient by ID');
    }
};

const findPatientByEmail = async (patientEmail) => {
    try {
        const patient = await Patient.findOne({ email: patientEmail });

        if (!patient) {
            throw new Error('Patient not found');
        }
        return patient;
    }catch(err) {
        throw new Error(err.message);
    }
};

const createPatient = async (patientData) => {
    try {
        const { userId, firstName, lastName, email, dateOfBirth, picture, genre, phone, history, identityId, identityType, socialWork, socialWorkId, proceedings, documents } = patientData;
        return await Patient.create({
            userId,
            firstName,
            lastName,
            email,
            dateOfBirth,
            picture,
            genre,
            phone,
            history,
            identityType,
            identityId,
            socialWork,
            socialWorkId,
            proceedings,
            documents
        });
    }catch(err) {
        throw new Error(err.message);
    }
}

const updatePatient = async (id, patientData) => {
    try {
        return await Patient.findOneAndUpdate({ _id: id }, patientData);
    }catch(err) {
        throw new Error(err.message);
    }
}

module.exports = {
    findAllPatients,
    findPatientById,
    findPatientByEmail,
    createPatient,
    updatePatient
};