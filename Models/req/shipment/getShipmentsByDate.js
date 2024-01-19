class ShipmentsByDate {
    constructor(args){
        this.date = args.date;
    }   
    to_arr(){
        return [this.date];
    }
}

exports.ShipmentsByDate = (args, callback) => {
    return callback(new ShipmentsByDate(args));
}