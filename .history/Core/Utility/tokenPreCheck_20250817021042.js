const {tokenParser} = require("../Engine/Token/tokenParser")


export async function _tokenPreCheck(db_handle, token) {
  try {
    const _tokens = tokenParser(token); // linked 
    
  } catch (err) {}
}
