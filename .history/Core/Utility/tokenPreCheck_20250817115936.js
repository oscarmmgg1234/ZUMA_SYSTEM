const {tokenParser = require("../Engine/Token/tokenParser");

/**
 * Remove all token segments whose 3rd field equals productID.
 * Token format: CLASS:FUNC_OR_ARG:PRODUCT_ID[:... up to 6 fields]
 */
const removeToken = (token, productID) => {
  if (!token || !productID) return token;

  const parts = token.trim().split(/\s+/);

  const filtered = parts.filter((piece) => {
    const fields = piece.split(":");
    if (fields.length < 3) return true; // keep malformed defensively
    return fields[2] !== productID; // drop if productID matches
  });

  return filtered.join(" "); // "" if everything was removed
};

exports._tokenPreCheck = async (db_handle, token, product) => {
  try {
    // Load the product so we know which token column we’re updating
    const selectSQL = "SELECT * FROM product WHERE PRODUCT_ID = ?";
    const [prodRows] = await db_handle.raw(selectSQL, [product]);
    const _product = prodRows?.[0];
    if (!_product) {
      throw new Error(`Product ${product} not found`);
    }

    // Parse token stream & probe existence of each referenced productID
    const _tokens = tokenParser(token); // assumes a linked list-like API
    const existSQL = "SELECT NAME FROM product WHERE PRODUCT_ID = ?";

    let mutableToken = token;
    let changeEncountered = false;

    // Use a cursor to advance through the stream
    let cursor = _tokens;
    for (let i = 0; i < _tokens.size; i++) {
      const node = cursor.getData(); // expect { value, ... }
      const pid = node.value;

      const [rows] = await db_handle.raw(existSQL, [pid]);
      if (!rows || rows.length < 1) {
        // Strip ALL occurrences of this productID across the token string
        mutableToken = removeToken(mutableToken, pid);
        changeEncountered = true;
      }
      cursor.next();
    }

    if (changeEncountered) {
      // Figure out which product token column to update
      const tokenOptionRange = [
        { key: "ACTIVATION_TOKEN", token: _product.ACTIVATION_TOKEN },
        { key: "REDUCTION_TOKEN", token: _product.REDUCTION_TOKEN },
        { key: "SHIPMENT_TOKEN", token: _product.SHIPMENT_TOKEN },
      ];

      let changeKey = null;
      for (const item of tokenOptionRange) {
        if ((item.token || "") === (token || "")) {
          changeKey = item.key;
          break;
        }
      }

      if (!changeKey) {
        throw new Error("Unable to determine which token column to update");
      }

      // Use identifier escaping for the column name (??), value uses ?.
      const updateSQL = "UPDATE product SET ?? = ? WHERE PRODUCT_ID = ?";
      await db_handle.raw(updateSQL, [changeKey, mutableToken, product]);
    }

    return mutableToken; // may be "" if everything was removed
  } catch (err) {
    // Re-throw with context but keep original message
    throw new Error(`_tokenPreCheck failed: ${err.message || err}`);
  }
}
