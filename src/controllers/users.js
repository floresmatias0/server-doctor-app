const User = require("../models/user");
const Patient = require("../models/patient");
const mongoose = require('mongoose');
const { findAllPatients } = require("./patients");

const findAllUsers = async (filters = {}) => {
    try {
        const query = {};

        if (filters.role && Array.isArray(filters.role) && filters.role.length > 0) {
            query.role = { $in: filters.role };
        }

        if(filters.role && !Array.isArray(filters.role)) {
            query.role = filters.role;
        }

        return await User.find(query);
    } catch (err) {
        throw new Error(err.message);
    }
};

const findUserById = async (userId) => {
    try {
        if(userId && mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findOne({_id: userId});
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        }
    } catch (err) {
        throw new Error('Error fetching user by ID');
    }
};

const findUserByEmail = async (userEmail) => {
    try {
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return null;
        }
        return user;
    }catch(err) {
        throw new Error(err.message);
    }
};

const createUser = async (userData) => {
    try {
        const { name, firstName, lastName, email, role, picture, googleId, accessToken, refreshToken } = userData;
        return await User.create({
            name,
            firstName,
            lastName,
            email,
            role,
            picture,
            googleId,
            accessToken,
            refreshToken
        });
    }catch(err) {
        throw new Error(err.message);
    }
}

const updateUser = async (id, userData) => {
    try {
        return await User.findOneAndUpdate({ _id: id }, userData);
    }catch(err) {
        throw new Error(err.message);
    }
}

const deleteUser = async (id) => {
    try {
        await User.deleteOne({ _id: id });
        const patients = await findAllPatients({userId: id});

        if(patients?.length > 0) {
            for(let i = 0; i < patients?.length; i++) {
                await Patient.deleteOne({ _id: patients[i]?._id })
            }
        }
    }catch(err) {
        console.log(err)
        throw new Error(err.message);
    }
}

module.exports = {
    findAllUsers,
    findUserById,
    findUserByEmail,
    createUser,
    updateUser,
    deleteUser
};