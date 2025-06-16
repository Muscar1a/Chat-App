import CryptoJS from "crypto-js";
import forge from "node-forge";

// Tạo AES key (256-bit) và IV (128-bit)
export const generateAESKeyAndIV = (): { key: string; iv: string } => {
  const key = forge.random.getBytesSync(32); // 256-bit
  const iv = forge.random.getBytesSync(16);  // 128-bit
  return { key, iv };
};

// Mã hóa tin nhắn bằng AES (CBC, PKCS7)
export const encryptMessageWithAES = (
  message: string,
  key: string,
  iv: string
): string => {
  const encrypted = CryptoJS.AES.encrypt(
    message,
    CryptoJS.enc.Hex.parse(forge.util.bytesToHex(key)),
    {
      iv: CryptoJS.enc.Hex.parse(forge.util.bytesToHex(iv)),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );
  return encrypted.toString(); // base64 string
};

// Mã hóa khóa AES bằng RSA-OAEP public key
export const encryptAESKeyWithRSA = (
  aesKey: string,
  publicKeyPem: string
): string => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encryptedKey = publicKey.encrypt(aesKey, "RSA-OAEP", {
    md: forge.md.sha256.create()
  });
  return forge.util.encode64(encryptedKey);
};

// Chuyển ArrayBuffer sang PEM (Public hoặc Private)
function convertBinaryToPEM(binaryData: ArrayBuffer, label: string): string {
  const base64String = window.btoa(
    String.fromCharCode(...new Uint8Array(binaryData))
  );
  const formatted = base64String.match(/.{1,64}/g)?.join("\n") ?? base64String;
  return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
}

// Mã hóa private key bằng AES
function encryptPrivateKey(privateKeyPem: string, password: string): string {
  return CryptoJS.AES.encrypt(privateKeyPem, password).toString(); // base64 string
}

// Sinh cặp khóa RSA và mã hóa khóa riêng
export async function generateAndEncryptRSAKeyPair(
  password: string
): Promise<{ publicKeyPem: string; encryptedPrivateKeyPem: string }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKeyBuffer = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  const privateKeyBuffer = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  const publicKeyPem = convertBinaryToPEM(publicKeyBuffer, "PUBLIC KEY");
  const privateKeyPem = convertBinaryToPEM(privateKeyBuffer, "PRIVATE KEY");
  const encryptedPrivateKeyPem = encryptPrivateKey(privateKeyPem, password);

  return {
    publicKeyPem,
    encryptedPrivateKeyPem // dùng để lưu trữ trên server
  };
}
