const server = require('express').Router();
const { updateUser, findUserById } = require('../../controllers/users');
const validateDoctorAndUpdateDB = require('../../helpers/validateDoctor')

const validateDoctorDataComplete = async(user, id) => {
    if(user.socialWorkId != 0 && user.identityId != 0 && user.socialWork != "" && user.enrollment != "") {
        const updateUserData = await updateUser(id, {validated:'pending'});
        validateDoctorAndUpdateDB(id, updateUserData.identityId, user.firstName, user.lastName, user.email)
        return updateUserData
    }
}

server.put('/:id', async (req, res) => {
        const { id } = req.params;
        const data = req.body;

        try {
            await updateUser(id, data);
            const user = await findUserById(id)
            
            const updateUserData = user.role === "DOCTOR" ? await validateDoctorDataComplete(user,id): user

            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }
);



module.exports = server;