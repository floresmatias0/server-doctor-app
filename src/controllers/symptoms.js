const Symptom = require("../models/symptoms");

const findAllSymptoms = async (filters) => {
    try {
        return await Symptom.find(filters);
    }catch(err) {
        throw new Error(err.message);
    }
};

const createSymptom = async (data) => {
    try {
        const { name } = data;

        return await Symptom.create({name});
    }catch(err) {
        throw new Error(err.message)
    }
}

const deleteSymptom = async (id) => {
    try {
        await Symptom.deleteOne({ _id: id });
    }catch(err) {
        throw new Error(err.message);
    }
}

module.exports = {
    findAllSymptoms,
    createSymptom,
    deleteSymptom
};