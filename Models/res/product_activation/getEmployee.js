class getEmployee {
  constructor(args) {
    this.employees = args.map((obj) => {
      return { EMPLOYEE_ID: obj.EMPLOYEE_ID, NAME: obj.NAME };
    });
  }
}

const getEmployees = (args, callback) => {
  const data = new getEmployee(args);
  return callback(data);
};

exports.getEmployee = getEmployees;
