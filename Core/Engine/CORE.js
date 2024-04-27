/*
author: Oscar Maldonado
date: 04/18/2024
Api Engine 2.0
*/

const { core_engine } = require("./CORE_ENGINE");
const { init_services } = require("../../Services/Services.js");
const process = require("process");

const services = init_services();

const core_exec = async (args, barcodeInput) => {
  try {
    const coreSuccess = await core_engine(args);
    if (process.argv[2] == "dev") {
      console.log("Core success:", coreSuccess);
    }
    if (!coreSuccess) {
      return { status: "error", message: "Core engine failed" };
    }

    const success = {
      status: "success",
      message: "Transaction completed successfully",
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
      return { ...success, barcodeBuffer: barcodeData };
    }

    return success;
  } catch (error) {
    return { status: "error", message: `Error: ${error.message}` };
  }
};

exports.core_exec = core_exec;
