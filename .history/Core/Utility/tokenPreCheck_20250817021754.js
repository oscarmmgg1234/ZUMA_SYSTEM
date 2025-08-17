const {tokenParser} = require("../Engine/Token/tokenParser")

const removeToken = (token, productID) => {
    
} 

export async function _tokenPreCheck(db_handle, token) {
  try {
    const _tokens = tokenParser(token); // linked list of tokens
    const _sql = "SELECT NAME FROM product WHERE PRODUCT_ID = ?";
    let mutableToken = token;
    let responseArr = [];
    for(var i = 0; i < _tokens.size )
    
    
    
  } catch (err) {}
}
