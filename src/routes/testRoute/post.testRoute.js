const server = require('express').Router();
const validateDoctorAndUpdateDB = require('../../helpers/validateDoctor');

server.post('/',
  async(req,res) => {
    const data = req.body
    try {
      await validateDoctorAndUpdateDB(null, data.dni, null, null, null)
      res.status(200).send({ message: 'Test route works!', data });
    }catch(err) {
      return res.status(500).json({
        success: false,
        error: err.message
      })
    }
  }
)

module.exports = server