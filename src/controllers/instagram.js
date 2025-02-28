const Instagram = require('../models/instagram')
const axios = require('axios')
const { encryptToken, decryptToken } = require('../helpers/crypto')

const getToken = async (req, res) => {
  try {
    const instagramData = await Instagram.findOne({ id: 1 })
    if (instagramData) {
      const encryptedData = {
        iv: instagramData.ivToken,
        ciphertext: instagramData.currentToken
      }
      const currentToken = decryptToken(encryptedData)
      if (instagramData.expirationDate <= new (Date)) {
        const newToken = getNewToken(currentToken)
        return newToken
      } else {
        return currentToken
      }
    } else {
      return false
    }

  } catch (error) {
    console.log(error)
    throw new Error('Error fetching instagrama token')
  }
}

const getNewToken = async (currentToken) => {
  try {
    const refreshToken = axios.get(`https://graph.instagram.com/refresh_access_token
      ?grant_type=ig_refresh_token
      &access_token=${currentToken}`)
    const newCurrentToken = encryptToken(refreshToken.data.access_token)
    const expirationDate = new Date(Date.now() + refreshToken.data.expiresIn * 1000);
    await Instagram.findByIdAndUpdate({id}, {currentToken:newCurrentToken, expirationDate})
    return refreshToken.data.access_token
  } catch (error) {
    return error
  }
}
module.exports = getToken