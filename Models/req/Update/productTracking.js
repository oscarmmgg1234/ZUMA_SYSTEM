class trackingShema {
    constructor(args){
        this.productID = args.productID;
        this.quantity = args.quantity >= 0 ? args.quantity : null;
    }
    to_arr(){
        return [this.quantity, this.productID];
    }
}

exports.trackingShema = (args, callback) => {
    return callback(new trackingShema(args));
} 