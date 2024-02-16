const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");

const transaction_engine = (args) => {
  db(queries.development.getTransactionLog, args.to_arr(), (err, result) => {
    const transaction = result[0];
    db(
      queries.development.setTransactionReversed,
      args.to_arr(),
      (err, result) => {
        if (err) console.log(err);
      }
    );
    if (transaction.REVERSED === 1) {
      return;
    }
    if (transaction.ACTION === "activation") {
      transaction.ACTIVATION_STACK.forEach((item) => {
        db(queries.development.deleteActivationEntry, [item], (err, result) => {
          if (err) console.log(err);
        });
      });
      transaction.RELEASE_STACK.forEach((item) => {
        db(
          queries.development.deleteConsumptionEntry,
          [item],
          (err, result) => {
            if (err) console.log(err);
          }
        );
      });
     
    }
    if (transaction.ACTION === "shipment") {
      transaction.SHIPMENT_STACK.forEach((item) => {
        db(queries.development.deleteShipmentEntry, [item], (err, result) => {
          if (err) console.log(err);
        });
      });
      
    }
    if (transaction.ACTION === "comsumption") {
      transaction.RELEASE_STACK.forEach((item) => {
        db(
          queries.development.deleteConsumptionEntry,
          [item],
          (err, result) => {
            if (err) console.log(err);
          }
        );
      });
    }
  });
};

exports.transaction_engine = transaction_engine;
