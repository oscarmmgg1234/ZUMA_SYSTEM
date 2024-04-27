/*
Author: Oscar Maldonado
Date: 04/18/2024
Symbol Table
This module is used to create a symbol table linked list using the function registry for each token by parser linked list.
*/

const tokenParser = require("./tokenParser").tokenParser;
const { LinkedList } = require("../../Utility/LinkedList");
const process = require("process");

const symbolTable = (req_token, registry) => {
  try {
    //create symbol table linked list using function registry for each token by parser linked list
    //then it can iterate and then execute the token come engine porcessing time
    const list = tokenParser(req_token);
    if (!list) return null;
    const symbolTable = new LinkedList();
    list.reset();
    for (let i = 0; i < list.size; i++) {
      let current = list.getData();
      //process
      let functionReg = registry.getFunction(current.id).proto;
      if (process.argv[2] == "dev") {
        console.log("Function registry:", functionReg);
      }
      if (!functionReg) {
        throw new Error("Function not found in registry");
      }
      const symbolObject = {
        proto: functionReg,
        value: current.value,
        auxiliaryParam: current.auxiliaryParam,
        nextAuxiliaryParam: current.nextAuxiliaryParam,
        lastAuxiliaryParam: current.lastAuxiliaryParam,
      };
      symbolTable.append(symbolObject);
      list.next();
    }
    return symbolTable;
  } catch (e) {
    console.error("Error during symbolTable creation:", e);
  }
};

exports.symbolTable = symbolTable;
