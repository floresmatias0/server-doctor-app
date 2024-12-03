const Specialization = require("../models/specializations");

const findAllSpecializations = async (filters) => {
    try {
        const response = await Specialization.find(filters);
        return response
    } catch(err) {
        console.log(err)
        throw new Error(err.message);
    }
};

const createSpecialization = async (data) => {
    try {
        const { name } = data;
        return await Specialization.create({ name });
    } catch(err) {
        throw new Error(err.message);
    }
};

const deleteSpecialization = async (id) => {
    try {
        await Specialization.deleteOne({ _id: id });
    } catch(err) {
        throw new Error(err.message);
    }
};

module.exports = {
    findAllSpecializations,
    createSpecialization,
    deleteSpecialization
};
