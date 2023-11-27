let this_SecretKey;
let encryptionKey;

function setSecretKey(secretKey){
    this_SecretKey = secretKey
}

function setEncryptionKey(data){
    encryptionKey = data;
}

function getSecretKey(){
    return this_SecretKey;
}

function getEncryptionKey(){
    return encryptionKey;
}

module.exports = {
    setSecretKey,
    setEncryptionKey,
    getSecretKey,
    getEncryptionKey
}