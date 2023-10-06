
const {db} = require("./db_init.js");
const { queries } = require("./queries.js");

// const insertShipmentLog = (args) => {
//   var data = db.execute(queries.shipment_log.insert, args);
// };

const insertShipmentLog = (args) => {
    db.execute(queries.shipment_log.insert, args.to_arr(), (err)=>{
        if(err){
            console.log(err);
        }
    });
}

const selectAllShipmentLog = (callback) => {
  db.execute(queries.shipment_log.select_all, (err,result)=>{
    return callback(result);
  });
};

const updateShipmentLog = (args) => {
  db.execute(queries.shipment_log.update, args.to_arr(), (err)=>{
    if(err){
      console.log(err);
    }
  });
}



class db_interface{
  insert_shipment_log = (args,callback) => {
    return insertShipmentLog(args,(data)=>{return callback(data)});
  }
  select_all_shipment_log = (callback) => {
    return selectAllShipmentLog((data)=>{return callback(data)});
  }
  update_shipment_log = (args) => {
    updateShipmentLog(args);
  }

}

exports.db_interface = () => {
  return new db_interface();
}



