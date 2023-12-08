function isObjectOrArrayEmpty(obj) {
  if (Array.isArray(obj)) {
    return obj.length === 0;
  }
  return Object.keys(obj).length === 0;
}

function isObjectOrArrayValid(obj) {
  if (Array.isArray(obj)) {
    return obj.every((item) => item != null && item !== "");
  }
  return Object.keys(obj).every((key) => obj[key] != null && obj[key] !== "");
}

class ErrorHandling {
  constructor(obj, process_des, keyToCheck = null) {
    this.process_des = process_des;
    if (keyToCheck != null) {
      if (keyToCheck && obj.hasOwnProperty(keyToCheck)) {
        this.error =
          isObjectOrArrayEmpty(obj[keyToCheck]) ||
          !isObjectOrArrayValid(obj[keyToCheck]);
      } else {
        this.error = isObjectOrArrayEmpty(obj) || !isObjectOrArrayValid(obj);
      }
      this.err_message = this.error ? "Error In process" : "";
    }
  }

  isValid() {
    return !this.error;
  }

  getError() {
    return {
      error: this.error,
      err_message: this.err_message,
      process_des: this.process_des,
    };
  }
}

class ErrorRequest {
  constructor(obj) {
    this.error = !isObjectOrArrayValid(obj);
    this.err_message = "";
  }
  isValid() {
    return this.error;
  }
  getError() {
    return { error: this.error, err_message: "Invalid Request Format" };
  }
}

exports.ErrorRequest = ErrorRequest;
exports.ErrorHandling = ErrorHandling;
