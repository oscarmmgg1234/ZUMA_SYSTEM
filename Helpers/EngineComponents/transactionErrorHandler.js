exports.TransactionHandler = class transactionErrorHandler {
  constructor() {}
  sucessHandler() {
    return { status: true, message: "Transaction Successful" };
  }
  errorHandler(mess) {
    return { status: false, message: mess };
  }
};
