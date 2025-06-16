import CryptoJS from 'crypto-js';
import forge from 'node-forge';

/**
 * Giải mã khóa riêng đã được mã hóa AES và mã hóa dạng base64.
 * @param encryptedPrivateKeyBase64 Khóa riêng đã mã hóa dưới dạng base64.
 * @param password Mật khẩu để giải mã.
 * @returns Chuỗi PEM gốc của khóa riêng.
 */
export function decryptPrivateKey(encryptedPrivateKeyBase64: string, password: string): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKeyBase64, password);
  return decrypted.toString(CryptoJS.enc.Utf8); // PEM string
}

/**
 * Giải mã khóa AES được mã hóa bằng RSA-OAEP và trả về chuỗi nhị phân.
 * @param encryptedKeyBase64 Khóa AES được mã hóa base64.
 * @param privateKeyPem PEM của khóa riêng.
 * @returns Chuỗi nhị phân của khóa AES.
 */
export function decryptAESKeyWithPrivateKey(encryptedKeyBase64: string, privateKeyPem: string): string {
  const encryptedBytes = forge.util.decode64(encryptedKeyBase64);
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const aesKeyBytes = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });
  return aesKeyBytes; // binary string
}

/**
 * Giải mã nội dung đã được mã hóa bằng AES CBC.
 * @param ciphertext Chuỗi ciphertext (base64 hoặc hex).
 * @param aesKey Chuỗi nhị phân (binary string) chứa khóa AES.
 * @param ivHex IV dưới dạng chuỗi hex.
 * @returns Chuỗi văn bản thuần (plain text).
 */
export function decryptMessageWithAES(ciphertext: string, aesKey: string, ivHex: string): string {
  const decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Hex.parse(forge.util.bytesToHex(aesKey)), {
    iv: CryptoJS.enc.Hex.parse(ivHex),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
