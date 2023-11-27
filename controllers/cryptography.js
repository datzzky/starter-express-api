const crypto = require('crypto');

// Function to encrypt the secret key
function encryptSecretKey(secretKey, encryptionKey) {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encryptedSecretKey = cipher.update(secretKey, 'utf8', 'hex');
  encryptedSecretKey += cipher.final('hex');
  const encryptedData = iv.toString('hex') + encryptedSecretKey;
  return encryptedData;
}

function decryptSecretKey(encryptedSecretKey, encryptionKey) {
  try {
    if(!encryptedSecretKey){
      return 401
    }
    const iv = Buffer.from(encryptedSecretKey.slice(0, 32), 'hex');
    const encryptedData = encryptedSecretKey.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    let decryptedSecretKey = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedSecretKey += decipher.final('utf8');
    // console.log(' secret key deciphered');
    return decryptedSecretKey;
  } catch (error) {
    console.log(error,'could not open the secretKey')
  }
  
}

module.exports = {
  encryptSecretKey,
  decryptSecretKey
};
