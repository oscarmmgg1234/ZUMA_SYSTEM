// _tokenPreCheck.js
const { tokenParser } = require("../Engine/Token/tokenParser");

/** Collapse whitespace for reliable comparisons */
const norm = (s) => (s == null ? "" : String(s).trim().replace(/\s+/g, " "));

/**
 * Remove all token segments whose 3rd field equals productID.
 * Token format: CLASS:FUNC_OR_ARG:PRODUCT_ID[:...]
 */
const removeToken = (token, productID) => {
  const t = norm(token);
  if (!t || !productID) return "";
  const filtered = t.split(" ").filter((piece) => {
    const fields = piece.split(":");
    if (fields.length < 3) return true; // keep malformed defensively
    return fields[2] !== productID;
  });
  return filtered.length > 0 ? filtered.join(" ") : "";
};

/** Map any hint to an actual DB column name */
const resolveColumn = (hint) => {
  if (!hint) return null;
  const h = String(hint).toLowerCase();
  if (h === "activation" || h === "activation_token") return "ACTIVATION_TOKEN";
  if (h === "reduction"  || h === "reduction_token")  return "REDUCTION_TOKEN";
  if (h === "shipment"   || h === "shipment_token")   return "SHIPMENT_TOKEN";
  return null;
};

/**
 * _tokenPreCheck(db_handle, token, productID, opts?)
 * - opts.columnHint: "activation" | "reduction" | "shipment" | column name
 * - opts.mode: "commit" (default) | "dry-run"
 */
exports._tokenPreCheck = async (db_handle, token, product, opts = {}) => {
  const { columnHint = null, mode = "commit" } = opts;

  try {
    // If incoming token is empty/whitespace, just normalize to ""
    if (!norm(token)) return "";

    // Load product row to (a) verify existence, (b) read current token columns
    const [prodRows] = await db_handle.raw("SELECT * FROM product WHERE PRODUCT_ID = ?", [product]);
    const _product = prodRows?.[0];
    if (!_product) throw new Error(`Product ${product} not found`);

    // Parse each piece and drop references to non-existent product IDs
    const parser = tokenParser(token);
    let mutableToken = norm(token);
    let changeEncountered = false;

    const existSQL = "SELECT 1 FROM product WHERE PRODUCT_ID = ? LIMIT 1";
    for (let i = 0; i < parser.size; i++) {
      const node = parser.getData();
      const pid = node?.value;
      if (!pid) { parser.next(); continue; }

      const [rows] = await db_handle.raw(existSQL, [pid]);
      const exists = Array.isArray(rows) ? rows.length > 0 : !!rows;
      if (!exists) {
        mutableToken = removeToken(mutableToken, pid);
        changeEncountered = true;
      }
      parser.next();
    }

    // Nothing changed? Return incoming (normalized) token.
    if (!changeEncountered) return mutableToken;

    // Decide which column to update.
    // 1) Use explicit hint if provided.
    let changeKey = resolveColumn(columnHint);

    // 2) Otherwise, infer by comparing normalized strings.
    if (!changeKey) {
      const candidates = [
        { key: "ACTIVATION_TOKEN", val: norm(_product.ACTIVATION_TOKEN) },
        { key: "REDUCTION_TOKEN",  val: norm(_product.REDUCTION_TOKEN)  },
        { key: "SHIPMENT_TOKEN",   val: norm(_product.SHIPMENT_TOKEN)   },
      ];
      const incomingNorm = norm(token);
      const matches = candidates.filter((c) => c.val === incomingNorm);

      if (matches.length === 1) {
        changeKey = matches[0].key;
      } else if (matches.length > 1) {
        // Ambiguous equality across columns; prefer not to guess
        throw new Error("Ambiguous token source column; provide a columnHint");
      } else {
        // No exact match (maybe caller passed a detached copy); use a heuristic:
        // choose the first column whose content contains the incoming token
        const fuzzy = candidates.filter((c) => c.val && c.val.includes(incomingNorm));
        if (fuzzy.length === 1) {
          changeKey = fuzzy[0].key;
        }
      }
    }

    // 3) If still unknown, require the caller to tell us.
    if (!changeKey) {
      throw new Error("Unable to determine which token column to update");
    }

    // Mutate only in commit mode
    if (mode !== "dry-run") {
      const updateSQL = "UPDATE product SET ?? = ? WHERE PRODUCT_ID = ?";
      await db_handle.raw(updateSQL, [changeKey, mutableToken, product]);
    }

    return mutableToken;
  } catch (err) {
    throw new Error(`_tokenPreCheck failed: ${err.message || err}`);
  }
};
