class delete_shimpent_entry {
  constructor(args) {
    this.SHIPMENT_ID = args.SHIPMENT_ID;
  }
  to_arr() {
    return [this.SHIPMENT_ID];
  }
}

const delete_shipment_entry_model = (args, callback) => {
  const data = new delete_shimpent_entry(args);
  return callback(data);
};

exports.delete_shipment_model = delete_shipment_entry_model;
