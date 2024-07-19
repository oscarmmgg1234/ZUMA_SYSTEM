/*
author: Oscar Maldonado
date: 04/18/2024
Api Engine 2.0
*/

const { core_engine } = require("./CORE_ENGINE");
const { init_services } = require("../../Services/Services.js");
const process = require("process");


//translateAndGenerateToken();
const services = init_services();

const core_exec = async (args, barcodeInput) => {
  try {
    const coreSuccess = await core_engine(args);
    if (process.argv[2] == "dev") {
      console.log("Core success:", coreSuccess);
    }
    if (!coreSuccess) {
      return {
        status: "error",
        message: "Core engine failed",
        product: {
          id: args.PRODUCT_ID ? args.PRODUCT_ID : "Unknown",
          name: args.PRODUCT_NAME ? args.PRODUCT_NAME : "Unknown",
        },
      };
    }

    const success = {
      status: "success",
      message: "Transaction completed successfully",
      product: {
        id: args.PRODUCT_ID ? args.PRODUCT_ID : "Unknown",
        name: args.PRODUCT_NAME ? args.PRODUCT_NAME : "Unknown",
      },
    };

    if (barcodeInput) {
      const barcodeData = await new Promise((resolve, reject) => {
        services.barcode_gen(barcodeInput, (data) => {
          if (data) {
            resolve(data);
          } else {
            reject("Barcode generation failed");
          }
        });
      });
      return {
        ...success,
        barcodeBuffer: barcodeData,
        product: {
          id: args.PRODUCT_ID ? args.PRODUCT_ID : "Unknown",
          name: args.PRODUCT_NAME ? args.PRODUCT_NAME : "Unknown",
        },
      };
    }

    return success;
  } catch (error) {
    return {
      status: "error",
      message: `Error: ${error.message}`,
      product: {
        id: args.PRODUCT_ID ? args.PRODUCT_ID : "Unknown",
        name: args.PRODUCT_NAME ? args.PRODUCT_NAME : "Unknown",
      },
    };
  }
};
exports.core_exec = core_exec;
