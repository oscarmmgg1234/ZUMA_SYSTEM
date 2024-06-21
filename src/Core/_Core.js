const {query_manager} = require("../Database/_DBManager")


class Core {
    constructor() {
        if (Core.instance instanceof Core) {
            return Core.instance;
        }
        this._dbExecutor = query_manager;
        this._perDay = new map();
        this._perWeek = new map();
        this._perMonth = new map();
    }
    async _init() {
        //cron job we run it every day at 3am
        this._perDay.clear()
        this._perWeek.clear()
        this._perMonth.clear()
        const products = await this._dbExecutor("product_inventory").select("*");

    }
    
    perDay = () => {

    }
    perWeek = () => {

    }
    perMonth = () => {

    }
    _Update(){
        //receive endpoint call from inv and update each product as you go for performance and scalability
    }
    _getAnalyticsAll = () => {
        //return all analytics
    }
    _getAnalyticsById = (id) => {
        //return analytics by id
    }
    _postAnalyticsByDay = (id) => {
        // post db by day per product
    }
}