const { tokenParser } = require("../Engine/Token/tokenParser");

const removeToken = (token, productID) => {
  if (!token || !productID) return token;

  // Split on any whitespace; ignore empty splits
  const parts = token.trim().split(/\s+/);

  const filtered = parts.filter((piece) => {
    // Defensive: keep malformed pieces that don't have at least 3 fields
    const fields = piece.split(":");
    if (fields.length < 3) return true;
    return fields[2] !== productID;
  });

  // Re-join with single spaces; if everything is removed, returns ""
  return filtered.join(" ");
};

export async function _tokenPreCheck(db_handle, token, product) {
  try {
    const _tokens = tokenParser(token); // linked list of tokens
    const _sql = "SELECT * FROM product WHERE PRODUCT_ID = ?";
    const _product = await db_handle.raw(_sql, [_token.value])
    let mutableToken = token;
    let changeEncountered = false;
    for (var i = 0; i < _tokens.size; i++) {
      const _token = _tokens.getData();
      const response = await db_handle.raw(_sql, [_token.value]);
      if (response[0].row.length < 1) {
        mutableToken = removeToken(mutableToken, _token.value);
        changeEncountered = true;
      }
      _token.next();
    }
    if(changeEncountered){
        //push new token for this product
    }
    return mutableToken;
  } catch (err) {
    throw new Error(err);
  }
}
