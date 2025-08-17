const { tokenParser } = require("../Engine/Token/tokenParser");

const removeToken = (token, productID) => {
  if (!token || !productID) return token;

  // Split tokens by space into array of segments
  const parts = token.split(/\s+/);

  // Keep only those that do not end with :productID
  const filtered = parts.filter((part) => {
    const segments = part.split(":");
    return segments[segments.length - 1] !== productID;
  });

  // Recombine into a single string
  return filtered.join(" ");
};

export async function _tokenPreCheck(db_handle, token) {
  try {
    const _tokens = tokenParser(token); // linked list of tokens
    const _sql = "SELECT NAME FROM product WHERE PRODUCT_ID = ?";
    let mutableToken = token;
    let changeEncountered = false;
    for (var i = 0; i < _tokens.size; i++) {
      const _token = _tokens.getData();
      const response = await db_handle.raw(_sql, [_token.value]);
      if (response[0].row.length < 1) {
        mutableToken = removeToken(token, _token.value);
        changeEncountered = true;
      }
      _token.next();
    }
    return mutableToken;
  } catch (err) {
    throw new Error(err);
  }
}
