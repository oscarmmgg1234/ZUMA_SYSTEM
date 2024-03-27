const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");
const { db_interface } = require("../DB/interface.js");
const {
  product_analytics,
} = require("../Models/req/Dashboard/getProductAnalytics.js");
const {
  activationEngineComponents,
} = require("./EngineComponents/Activation/activationEngine.js");
const {
  activationProtocols,
} = require("./EngineComponents/Activation/activationProtocols.js");
const {
  activationSubProtocols,
} = require("./EngineComponents/Activation/activationSubProtocols.js");
const { query_manager } = require("../DB/query_manager.js");

const engineHelper = activationEngineComponents;
const protocols = activationProtocols();
const subProtocols = activationSubProtocols();
const db_api = db_interface();
const knex = query_manager;

//think about wether its worth creating exeption rules or just create a diffrent protocol for product that meets exeption rule
//think about this a bit more => maintanance, add products, remove product, tweaks to products

//special product exeptions //think about wether its worth creating exeption rules or just create a diffrent protocol for product that meets exeption rule
const exeptions = [
  "78c8da4d",
  "4d1f188e",
  "cc53b880",
  "4377889f",
  "db1386a2",
  "2f24a868",
  "a897effe",
  "5f7dbd29",
  "5770875f",
  "411be6dd",
  "433retyt",
  "decad337",
  "092f5ec4",
  "bf198df2",
  "3ae608b6",
  "d5c06e4f",
  "403933d3",
  "342fr32e",
  "236gh33j",
];

//detergent //pet-shampoo //Zeolite
//run each protocol and if product matches exeption rule then run exeption protocol
//gets products from db to allow dynamic addition of feature products
const getProducts = (callback) => {
  db(queries.activation_product.get_products, (err, result) => {
    if (err) {
      console.log(err);
      // Assuming there is a mechanism to indicate failure to the callback // Indicate an error occurred
    }
    callback(result); // Success case, pass results and no error
  });
};

//foundation of activation engine
const getProductProccessInfo = (args, callback) => {
  //1st step
  const component_regex = engineHelper.createRegex(args.PRODUCT_NAME);
  //parses request object and create obj needed for protocols
  const glycerin_exeption =
    args.GLYCERIN_RATIO_OZ != null || args.GLYCERIN_RATIO_GAL != 0
      ? true
      : false;
  getProducts((products) => {
    const process_info = products.filter((product) => {
      return product.PRODUCT_ID === args.PRODUCT_ID;
    });

    const product_components = products.filter((product) => {
      return product.NAME.match(component_regex);
    });

    const formated_components = product_components.filter((product) => {
      if (args.PRODUCT_NAME.includes("30ml")) {
        if (product.NAME.includes("30ml")) {
          return product;
        }
        if (product.NAME.includes("Gal") && !product.NAME.includes("Label")) {
          return product;
        }
        if (args.PRODUCT_NAME == product.NAME) {
          return product;
        }
      }
      if (args.PRODUCT_NAME.includes("Sm")) {
        if (product.NAME.includes("Sm")) {
          return product;
        }
      }

      if (!args.PRODUCT_NAME.includes("30ml")) {
        if (!product.NAME.includes("30ml")) {
          if (product.NAME.includes("Gal")) {
            return product;
          }
          if (product.NAME.includes("Label") && !product.NAME.includes("Sm")) {
            return product;
          }
          if (args.PRODUCT_NAME == product.NAME) {
            return product;
          }
        }
      }
    });
    return callback({
      quantity: args.QUANTITY * args.MULTIPLIER,
      process_type: process_info[0].PROCESS_TYPE,
      process_component: process_info[0].PROCESS_COMPONENT_TYPE,
      product_id: process_info[0].PRODUCT_ID,
      product_name: process_info[0].NAME,
      product_components: formated_components,
      employee_id: args.EMPLOYEE_ID,
      glycerin_exeption: glycerin_exeption,
    });
  });
};

//main function driver
const main_activation = (args, callback) => {
  db_api.addTransaction({ src: "activation", args: args });
  //main function that chooses type of activation and type component of activation
  setTimeout(() => {
    getProductProccessInfo(
      args,
      ({
        process_type,
        process_component,
        product_id,
        product_name,
        product_components,
        quantity,
        employee_id,
        glycerin_exeption,
      }) => {
        const TRANSACTIONID = args.TRANSACTIONID;
        protocols.forEach((protocol, index) => {
          if (index + 1 == process_type) {
            protocol(
              {
                product_id,
                product_name,
                product_components,
                quantity,
                employee_id,
                TRANSACTIONID,
                glycerin_exeption,
              },
              exeptions,
              subProtocols,
              process_component,
              (status) => {
                // return callback(status);
                if (status.status == false) {
                  knex.raw(
                    "DELETE FROM transaction_log WHERE TRANSACTIONID = ?",
                    [TRANSACTIONID]
                  );
                }

                return callback(status);
              }
            );
          }
        });
        // if (process_component != null) {
        //   subProtocols.forEach((protocol, index) => {
        //     if (index + 1 === process_component) {
        //       protocol(
        //         { process_component, quantity, employee_id, TRANSACTIONID },
        //         exeptions
        //       );
        //     }
        //   });
        // }
      }
    );
  }, 300);
};

exports.activation_engine = main_activation;
