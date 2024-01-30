class deleteCompanySchema {
    constructor(args) {
        this.companyId = args.companyId;
    }
    to_arr() {
        return [this.companyId];
    }
}

exports.deleteCompany = (args, callback) => {
    return callback(new deleteCompanySchema(args));
};
