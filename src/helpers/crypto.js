const crypto = require('crypto');

const SECRET_KEY = process.env.SECRET_KEY || 'clave_secreta_default';
const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
const IV_LENGTH = 16;

const encryptToken = (token) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(token, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return {
    iv: iv.toString('base64'),
    ciphertext: encrypted
  };
};

const decryptToken = (encryptedData) => {
  try {
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedData.ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error en decryptToken:', error.message);
    return null;
  }
};

module.exports = { encryptToken, decryptToken };
