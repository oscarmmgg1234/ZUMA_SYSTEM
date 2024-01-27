class consumptionByDate {
    constructor(args) {
    this.date = args.date;
    }
    to_arr() {
        return [this.date];
    }
}

exports.consumptionByDate = (args, callback) => {
    return callback(new consumptionByDate(args));
}
