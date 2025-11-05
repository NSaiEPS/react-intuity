import CryptoJS from "crypto-js";

export function decryptFromPHP(encryptedBase64) {
  const envKey = import.meta.env.VITE_ENCRYPTION_KEY;
  const envIV = import.meta.env.VITE_ENCRYPTION_DECRYPTION_IV;

  const key = CryptoJS.enc.Utf8.parse(envKey);
  const iv = CryptoJS.enc.Utf8.parse(envIV);

  // PHP gives Base64 string, decrypt directly
  const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
    iv,
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.NoPadding,
  });

  // Use Latin1 to avoid UTF-8 decoding issues
  return decrypted.toString(CryptoJS.enc.Latin1);
}
