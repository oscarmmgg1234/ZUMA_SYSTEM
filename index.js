const express = require('express');
const server = express();
const cors = require('cors');
const inv_route = require('./Server/Routes/INVENTORY/Routes');
const emp_route = require('./Server/Routes/EMPLOYEE/Routes');

server.use(cors());
server.use(express.json());
server.use('/inventory', inv_route);
server.use('/employee', emp_route);


server.listen(3003, () => {
    console.log('Server is running on port 3003 ... 🖨️');
})