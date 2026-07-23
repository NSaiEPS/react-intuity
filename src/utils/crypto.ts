const SECRET = "Intuity@Payment#2026";

export const encrypt = (text: string | number) => {
  const value = String(text);

  const encrypted = value
    .split("")
    .map((char, index) =>
      String.fromCharCode(
        char.charCodeAt(0) ^ SECRET.charCodeAt(index % SECRET.length)
      )
    )
    .join("");

  return btoa(encrypted)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const decrypt = (text: unknown) => {
  const value = String(text);

  const decoded = atob(
    value.replace(/-/g, "+").replace(/_/g, "/")
  );

  return decoded
    .split("")
    .map((char, index) =>
      String.fromCharCode(
        char.charCodeAt(0) ^ SECRET.charCodeAt(index % SECRET.length)
      )
    )
    .join("");
};