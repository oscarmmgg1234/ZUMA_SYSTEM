const {tokenParser} = require("../Engine/Token/tokenParser")

const removeToken = (token, productID) => {
    
} 

export async function _tokenPreCheck(db_handle, token) {
  try {
    const _tokens = tokenParser(token); // linked list of tokens
    const _sql = "SELECT NAME FROM product WHERE PRODUCT_ID = ?";
    let mutableToken = token;
    const responseAr
    
    
    
  } catch (err) {}
}
