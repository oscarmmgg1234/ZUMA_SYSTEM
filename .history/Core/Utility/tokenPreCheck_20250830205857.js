const { tokenParser } = require("../Engine/Token/tokenParser");

/**
 * Remove all token segments whose 3rd field equals productID.
 * Token format: CLASS:FUNC_OR_ARG:PRODUCT_ID[:... up to 6 fields]
 */
const removeToken = (token, productID) => {
  if (!token || !productID) return token || ""; // ✅ always string

  // defensive: if token is empty after trim, return ""
  const trimmed = token.trim();
  if (!trimmed) return "";

  const parts = trimmed.split(/\s+/);

  const filtered = parts.filter((piece) => {
    const fields = piece.split(":");
    if (fields.length < 3) return true; // keep malformed defensively
    return fields[2] !== productID; // drop if productID matches
  });

  return filtered.length > 0 ? filtered.join(" ") : "";
};

exports._tokenPreCheck = async (db_handle, token, product) => {
  try {
    console.log()
    // ✅ If token is falsy or just whitespace, return empty string
    if (!token || !token.trim()) return "";

    // Load the product so we know which token column we’re updating
    const selectSQL = "SELECT * FROM product WHERE PRODUCT_ID = ?";
    const [prodRows] = await db_handle.raw(selectSQL, [product]);
    const _product = prodRows?.[0];
    if (!_product) {
      throw new Error(`Product ${product} not found`);
    }

    // Parse token stream & probe existence of each referenced productID
    const _tokens = tokenParser(token);
    const existSQL = "SELECT NAME FROM product WHERE PRODUCT_ID = ?";

    let mutableToken = token;
    let changeEncountered = false;

    let cursor = _tokens;
    for (let i = 0; i < _tokens.size; i++) {
      const node = cursor.getData();
      const pid = node.value;

      const [rows] = await db_handle.raw(existSQL, [pid]);
      if (!rows || rows.length < 1) {
        mutableToken = removeToken(mutableToken, pid);
        changeEncountered = true;
      }
      cursor.next();
    }

    if (changeEncountered) {
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

      const updateSQL = "UPDATE product SET ?? = ? WHERE PRODUCT_ID = ?";
      await db_handle.raw(updateSQL, [changeKey, mutableToken, product]);
    }

    return mutableToken.trim() || "";
  } catch (err) {
    throw new Error(`_tokenPreCheck failed: ${err.message || err}`);
  }
};
