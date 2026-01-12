import CryptoJS from "crypto-js";

// Decrypt PHP OpenSSL AES-256-CBC encrypted data (Salted__)
export const decryptAESFromPHP = (cipherTextBase64: string, passphrase: string) => {
  try {
    const cipherData = CryptoJS.enc.Base64.parse(cipherTextBase64);

    // Check for "Salted__" header
    const saltedPrefix = CryptoJS.enc.Latin1.parse("Salted__");
    const header = CryptoJS.lib.WordArray.create(cipherData.words.slice(0, 2)); // first 8 bytes

    if (!CryptoJS.enc.Latin1.stringify(header).startsWith("Salted__")) {
      throw new Error("Invalid salt header");
    }

    // Extract salt (next 8 bytes)
    const salt = CryptoJS.lib.WordArray.create(cipherData.words.slice(2, 4));

    // Ciphertext (skip first 16 bytes = "Salted__" + 8-byte salt)
    const ct = CryptoJS.lib.WordArray.create(cipherData.words.slice(4));

    // OpenSSL key & IV derivation
    const keyIv = CryptoJS.EvpKDF(passphrase, salt, {
      keySize: 8 + 4, // 32 bytes key (8 words) + 16 bytes IV (4 words)
      iterations: 1,
      hasher: CryptoJS.algo.MD5,
    });

    const key = CryptoJS.lib.WordArray.create(keyIv.words.slice(0, 8));
    const iv = CryptoJS.lib.WordArray.create(keyIv.words.slice(8, 12));

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ct } as any,
      key,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("AES Decryption failed:", err);
    return null;
  }
};

// Encrypt for PHP OpenSSL AES-256-CBC (Salted__)
export const encryptAESForPHP = (plainText: string, passphrase: string) => {
  try {
    const salt = CryptoJS.lib.WordArray.random(8);
    const keyIv = CryptoJS.EvpKDF(passphrase, salt, {
      keySize: 8 + 4, // 32 bytes key + 16 bytes IV
      iterations: 1,
      hasher: CryptoJS.algo.MD5,
    });
    
    const key = CryptoJS.lib.WordArray.create(keyIv.words.slice(0, 8));
    const iv = CryptoJS.lib.WordArray.create(keyIv.words.slice(8, 12));
    
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    // Combine Salted__ + salt + ciphertext
    const saltedHeader = CryptoJS.enc.Latin1.parse("Salted__");
    const encryptedBytes = encrypted.ciphertext;
    
    const finalBuffer = saltedHeader
      .concat(salt)
      .concat(encryptedBytes);
      
    return finalBuffer.toString(CryptoJS.enc.Base64);
  } catch (err) {
    console.error("AES Encryption failed:", err);
    return null;
  }
};