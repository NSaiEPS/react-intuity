import CryptoJS from "crypto-js";

export function decryptFromPHP(encryptedBase64: string): string {
  const envKey = import.meta.env.VITE_ENCRYPTION_KEY as string | undefined;
  const envIV = import.meta.env.VITE_ENCRYPTION_DECRYPTION_IV as string | undefined;

  if (!envKey || !envIV) {
    console.error("VITE_ENCRYPTION_KEY or VITE_ENCRYPTION_DECRYPTION_IV is not set in environment");
    return "";
  }

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
