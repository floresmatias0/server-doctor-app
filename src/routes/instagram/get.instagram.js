const server = require('express').Router()
const getToken = require('../../controllers/instagram')

server.get('/', async (req,res)=> {
    try {
      const result = await getToken(req, res)
      return res.status(200).json({
        success: true,
        result
      });

    }catch(error){
      return res.status(500).json({
        success: false,
        error: error.message
    });
    }
  }
)

module.exports = server