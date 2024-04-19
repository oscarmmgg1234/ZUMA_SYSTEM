const tokenParser = require('./tokenParser').tokenParser;
const {FunctionRegistry} = require('./functionRegistry');

const symbolTable = (req_token) => {
    //create symbol table linked list using function registry for each token by parser linked list 
    //then it can iterate and then execute the token come engine porcessing time
    const list = tokenParser(req_token);
    if(!list) return null;
    const symbolTable = new LinkedList();
    list.reset();
    for(let i = 0; i < list.size; i++){
        let current = list.getData();
        //process 
        let functionReg = FunctionRegistry.getFunction(current.key, current.id);
        const symbolObject = {
            proto: functionReg,
            value: current.value,
            custom: current.custom
        }
        symbolTable.append(symbolObject);
        list.next();
    }
    return symbolTable;
}

exports.symbolTable = symbolTable;
