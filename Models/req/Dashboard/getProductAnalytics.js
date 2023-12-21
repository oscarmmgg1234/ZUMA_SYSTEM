

class product_analytics {
    constructor(args){
        this.PRODUCT_ID = args.PRODUCT_ID;
    }
    to_array(){
        return [this.PRODUCT_ID];
    }
}

exports.product_analytics = (args, callback) => {
    const data = new product_analytics(args);
    return callback(data);
}