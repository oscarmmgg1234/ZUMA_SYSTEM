class RevertTransactionSchema {
  constructor(args) {
    this.transactionID = args.transactionID;
  }
  to_arr() {
    return [this.transactionID];
  }
}

exports.reverseTransaction = (args, callback) => {
  return callback(new RevertTransactionSchema(args));
};
