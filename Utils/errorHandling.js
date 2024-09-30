/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2024-09-15 14:59:09

 temp

*/

class errorHandling {
  constructor(data, message, err_code) {
    this.data = data ? data : [];
    this.message = message ? message : "";
    this.err_code = err_code ? err_code : null;
  }

  error() {
    return {
      status: false,
      message: this.message,
      data: this.data,
      err_code: this.err_code,
    };
  }
}

function H_Error(data, message, error_code) {
  return new errorHandling(data, message, error_code).error();
}

module.exports = { H_Error };
