const {query_manager} = require("../DB/db_init.js");
const {productAlert} = require("../NotificationEngine/productStockAlert.js");


class Controller {
    constructor() {
        if(Controller.instance instanceof Controller) {
            return Controller.instance;
        }
    }
    async getProductNotifications() {
        return await productAlert();
    }
    
}


module.exports = new Controller();