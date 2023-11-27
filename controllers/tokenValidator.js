const jwt = require('jsonwebtoken');
const {decryptKey} = require('./keyLoker');
const {decryptSecretKey} = require('./cryptography');

function validateToken(encryptedKey,encryptedSecretKey,access_token) {
    if(!access_token){
      return false;
    }
    const encryptionKey = decryptKey(encryptedKey); //4 decrypt the string
    //console.log('in auth',encryptionKey)
    const secretKey = decryptSecretKey(encryptedSecretKey, encryptionKey);
    // console.log('in auth',secretKey)
    try {
        const decodedToken = jwt.verify(access_token, secretKey);
        // console.log(decodedToken);
        return true;
        // Access the decoded token properties as needed
      } catch (error) {
        console.error('Error decoding access token:', error);
        return false;
      }
}

module.exports ={ validateToken};

/*


*/