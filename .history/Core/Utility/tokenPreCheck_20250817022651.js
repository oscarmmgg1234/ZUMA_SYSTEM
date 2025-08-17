const { tokenParser } = require("../Engine/Token/tokenParser");

const removeToken = (token, productID) => {
  // example token pre removing AC:1023:vJbYDU9O RD:10fd:vJbYDU9O UP:2j3w:vJbYDU9O UP:23hs:vJbYDU9O RD:10fd:B6WpKloH UP:23hs:B6WpKloH RD:10fd:40a1fbc3 UP:23hs:40a1fbc3
      //remove B6WpKloH so then AC:1023:vJbYDU9O RD:10fd:vJbYDU9O UP:2j3w:vJbYDU9O UP:23hs:vJbYDU9O RD:10fd:40a1fbc3 UP:23hs:40a1fbc3

};

export async function _tokenPreCheck(db_handle, token) {
  try {
    const _tokens = tokenParser(token); // linked list of tokens
    const _sql = "SELECT NAME FROM product WHERE PRODUCT_ID = ?";
    let mutableToken = token;
    for (var i = 0; i < _tokens.size; i++) {
      const _token = _tokens.getData();
      const response = await db_handle.raw(_sql, [_token.value]);
      if (response[0].row.length < 1) {
        mutableToken = removeToken(token, _token.value);
      }
      _token.next();
    }
    return mutableToken;
  } catch (err) {
    throw new Error(err);
  }
}
