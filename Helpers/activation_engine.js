const { db } = require("../DB/db_init.js");
const { queries } = require("../DB/queries.js");
const {
  activationEngineComponents,
} = require("./EngineComponents/Activation/activationEngine.js");
const {
  activationProtocols,
} = require("./EngineComponents/Activation/activationProtocols.js");
const {
  activationSubProtocols,
} = require("./EngineComponents/Activation/activationSubProtocols.js");

const engineHelper = activationEngineComponents;
const protocols = activationProtocols();
const subProtocols = activationSubProtocols();

//think about wether its worth creating exeption rules or just create a diffrent protocol for product that meets exeption rule
//think about this a bit more => maintanance, add products, remove product, tweaks to products

// error handling
let success = { status: true, message: "success" };

//special product exeptions //think about wether its worth creating exeption rules or just create a diffrent protocol for product that meets exeption rule
const exeptions = ["78c8da4d", "4d1f188e"];

//detergent //pet-shampoo //Zeolite
//run each protocol and if product matches exeption rule then run exeption protocol
//gets products from db to allow dynamic addition of feature products
const getProducts = (callback) => {
  try {
    db.execute(queries.activation_product.get_products, (err, result) => {
      return callback(result);
    });
  } catch (err) {
    console.log(err);
    success.status = false;
    success.message = "error getting fetching products from db";
  }
};

//foundation of activation engine
const getProductProccessInfo = (args, callback) => {
  //1st step
  const component_regex = engineHelper.createRegex(args.PRODUCT_NAME);
  //parses request object and create obj needed for protocols

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
          if (product.NAME.includes("Label")) {
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
    });
  });
};

//main function driver
const main_activation = (args) => {
  //main function that chooses type of activation and type component of activation
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
    }) => {
      protocols.forEach((protocol, index) => {
        if (index + 1 == process_type) {
          protocol(
            {
              product_id,
              product_name,
              product_components,
              quantity,
              employee_id,
            },
            exeptions
          );
        }
      });
      if (process_component != null) {
        subProtocols.forEach((protocol, index) => {
          if (index + 1 === process_component) {
            protocol({ process_component, quantity, employee_id }, exeptions);
          }
        });
      }
    }
  );
};

exports.activation_engine = main_activation;
