const { queries } = require("../DB/queries.js");
const { db } = require("../DB/db_init.js");
const activation_engine = require("../Helpers/activation_engine.js");

const populate_base_components = () => {
  db.execute(queries.development.get_product, ["30"], (err, result) => {
    result.forEach((product) => {
      db.execute(
        queries.development.insert_test_quantity,
        [10000, product.PRODUCT_ID],
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    });
  });
};

const activation_engine_test = () => {
  //liquids
 setTimeout(() => {
  db.execute(queries.development.get_product, ["122"], (err, result) => {
    result.forEach((product, index) => {
        
      if (product.PRODUCT_ID === "d5c06e4f") {
        activation_engine.activation_engine(
          {
            PRODUCT_ID: product.PRODUCT_ID,
            PRODUCT_NAME: product.NAME,
            MULTIPLIER: "1",
            QUANTITY: 100,
            EMPLOYEE_NAME: "Oscar Maldonado",
            EMPLOYEE_ID: "000002",
          },
          (result) => {}
        );
        setTimeout(() => {
          db.execute(
            queries.development.get_activation_recent,
            [product.PRODUCT_ID],
            (err, result) => {
              console.log(
                `Activation Entry: id: ${result[0].PRODUCT_ID}, name: ${product.NAME}, quantity: ${result[0].QUANTITY}, index: ${result[0].INDEX}`
              );
              db.execute(
                queries.development.get_active_stock,
                [product.PRODUCT_ID],
                (err, result) => {
                  console.log(`Active Stock: ${result[0].ACTIVE_STOCK}, product id: ${result[0].PRODUCT_ID}`);
                }
              );
            }
          );

          console.log("\n");

          db.execute(
            queries.development.get_consumption_recent,
            (err, result) => {
              result.forEach((product) => {
                console.log(
                  `Consumption Entry: id: ${product.PRODUCT_ID}, quantity: ${product.QUANTITY}, index: ${product.entry_num}`
                );
                db.execute(
                  queries.development.get_stored_stock,
                  [product.PRODUCT_ID],
                  (err, result) => {
                    console.log(
                      `Stored Stock: ${result[0].STORED_STOCK} , product id: ${result[0].PRODUCT_ID}`
                    );
                  }
                );
              });
            }
          );
        }, 7000);
      }
    });

  });
}, 2000);

}

class engine_unit_test {
  test() {
    activation_engine_test();
  }
  populate_base_components() {
    populate_base_components();
  }
}

exports.engine_unit_test = engine_unit_test;
