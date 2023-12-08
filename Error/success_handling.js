class success_handling {
    constructor(data, process_des) {
        this.data = data;
        this.error = false;
        this.status = 200;
        this.process_des = process_des;
    }
    getSuccess() {
        return { error: this.error, data: this.data, process_des: this.process_des, status: this.status};
    }
    
}

exports.success_handling = success_handling;
