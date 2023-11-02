const User = require("../models/user");
const mongoose = require('mongoose');

const findAllUsers = async (filters) => {
    try {
        return await User.find(filters);
    }catch(err) {
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
        console.log({err})

        throw new Error('Error fetching user by ID');
    }
};

const findUserByEmail = async (userEmail) => {
    try {
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }catch(err) {
        throw new Error(err.message);
    }
};

const createUser = async (userData) => {
    try {
        const { name, email, role, picture, googleId, accessToken, refreshToken } = userData;
        return await User.create({
            name,
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

module.exports = {
    findAllUsers,
    findUserById,
    findUserByEmail,
    createUser,
    updateUser
};