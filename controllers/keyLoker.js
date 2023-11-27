const crypto = require('crypto');
//const serverKey = crypto.randomBytes(32);
const serverKey = Buffer.from('c0f6a74a5b23eaffc8dbb032f1d83e7f984d5ef969e4a1cfa542d036fb0c6c9e', 'hex');

// Function to encrypt the encryption key
function encryptKey(encryptionKey) {
  const encryptionKeyFromBuffer = encryptionKey.toString('hex');   //2 transform encryption key to string
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc', serverKey, iv);
  let encryptedKey = cipher.update(encryptionKeyFromBuffer, 'utf8', 'hex');
  encryptedKey += cipher.final('hex');
  const encryptedData = iv.toString('hex') + encryptedKey;
  return encryptedData;
}

function decryptKey(encryptedKey) {
  try {
      const iv = Buffer.from(encryptedKey.slice(0, 32), 'hex');
      const encryptedData = encryptedKey.slice(32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', serverKey, iv);
      let decryptedKey = decipher.update(encryptedData, 'hex', 'utf8');
      decryptedKey += decipher.final('utf8');
      // console.log('deciphered');
      return toBuffer = Buffer.from(decryptedKey, 'hex'); //5 back to buffer
  } catch (error) {
    console.error('could not open the data')
  }
    
}

module.exports = {
    encryptKey,
    decryptKey
};
