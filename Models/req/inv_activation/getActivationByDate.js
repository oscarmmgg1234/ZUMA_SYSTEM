class activationByDate {
  constructor(date) {
    this.date = args.date;
  }
  to_arr() {
    return [this.date];
  }
}

exports.activationByDate = (args, callback) => {
  return callback(new activationByDate(args));
};
