//think of way to monitor not only api call function but process execution and include timer for execution of such processes
// also could include Error handling and log errors for monitoring
// last thing to implement 
// integrate db
// clean up db and normalize
// create middleware api key integration 
// implement this on internal app
//update endpoints names to specify api and psudo process type // http://localhost:3000/api/shipment/insert_shipment

//also use chat gpt to refactor code and add comments to cleary explain code as well as clean it up

class sys_profiler{
    constructor(){
    this.init = true;
    this.profiler_endpoints_counter = new Map();
    this.profiler_processes_counter = new Map();
    this.profiler_endpoints_timer = new Map();
    this.profiler_processes_timer = new Map();
    this.profiler_processes_timer_avg = new Map();
    this.profiler_endpoints_counter_avg = new Map();
    }

    funcTypeTimer(func, args){
        const start = performance.now();
        func();
        const end = performance.now();
    }

    endpointCallCounter(){

    }
    
    addTrackerObject(type, name, profilerType){

    }

}

const sys_tracker = new sys_profiler();

exports.profiler = () => {
    return sys_tracker;
}

F