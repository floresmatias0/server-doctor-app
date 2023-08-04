const { User } = require("../db");

const findAllUsers = async () => {
    try {
        return await User.findAll();
    }catch(err) {
        throw new Error(err.message);
    }
};

const findUserById = async (userId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (err) {
        throw new Error('Error fetching user by ID');
    }
};

const findUserByEmail = async (userEmail) => {
    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }catch(err) {
        throw new Error(err.message);
    }
};

const verifyUserByEmail = async (userEmail) => {
    try {
        return await User.findOne({ where: { email: userEmail } });
    }catch(err) {
        throw new Error(err.message);
    }
};

const createUser = async (userData) => {
    try {
        const { firstName, lastName, username, email, password, role, image } = userData;
        return await User.create({
            firstName,
            lastName,
            username,
            email,
            password,
            role,
            image
        });
    }catch(err) {
        throw new Error(err.message);
    }
}

module.exports = {
    findAllUsers,
    findUserById,
    findUserByEmail,
    verifyUserByEmail,
    createUser
};