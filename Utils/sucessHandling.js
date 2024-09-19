/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2024-09-15 14:56:59

 temp

*/

class sucessHandling {
  constructor(data, message) {
    this.data = data ? data : [];
    this.message = message ? message : "";
  }

  sucess() {
    return { status: true, message: this.message, data: this.data };
  }
}

function H_Sucess(data, message) {
  return new sucessHandling(data, message).sucess();
}

module.exports = {H_Sucess};
