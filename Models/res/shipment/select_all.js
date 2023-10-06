class select_all {
    constructor(args){
        this.shpment_log = args.map((obj)=>{return { SHIPMENT_ID:obj.SHIPMENT_ID,
        QUANTITY: obj.QUANTITY,
        SHIPMENT_DATE: obj.SHIPMENT_DAT,
        COMPANY_ID: obj.COMPANY_ID,
        TYPE: obj.TYPE,
        EMPLOYEE_ID: obj.EMPLOYEE_ID,
        PRODUCT_ID: obj.PRODUCT_ID}})
    }


}

const select_all_model = (args,callback) => {
    const data = new select_all(args);
    return callback(data);
}

exports.select_all_model = select_all_model;