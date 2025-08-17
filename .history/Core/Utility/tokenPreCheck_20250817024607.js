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
    const _product = await db_handle.raw(_sql, [product])[0][0];
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
    if (changeEncountered) {
      //push new token for this product
      const tokenOptionRange = [
        { key: "ACTIVATION_TOKEN", token: _product.ACTIVATION_TOKEN },
        { key: "REDUCTION_TOKEN", token: _product.REDUCTION_TOKEN },
        { key: "SHIPMENT_TOKEN", token: _product.SHIPMENT_TOKEN },
      ];
      let changeKey = null;
      for (const item of tokenOptionRange) {
        if (item.token === token) {
          changeKey = item.key;
          break;
        }
      }
      if(!changeKey){
        throw new Error("No ")
      }
    }
    return mutableToken;
  } catch (err) {
    throw new Error(err);
  }
}
