/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2024-09-15 14:59:09

 temp

*/

class errorHandling {
  constructor(data, message) {
    this.data = data ? data : [];
    this.message = message ? message : "";
  }

  error() {
    return { status: false, message: this.message, data: this.data };
  }
}


function H_Error(data, message) {
  return new errorHandling(data, message).error();
}

module.exports = {H_Error};