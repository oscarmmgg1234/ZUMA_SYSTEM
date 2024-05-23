const Controller = require('../Core/Controller');

class handler {
    constructor(){
        if(handler.instance instanceof handler){
            return handler.instance;
        }
    }
    async getNotifications(req, res){
        try{
            const response = await Controller.getProductNotifications();
            res.status(200).send(response);
        } catch (error) {
            res.status(500).send(error);
        }
    }
}

module.exports = new handler();