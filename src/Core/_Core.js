const { is, ca, fi } = require("date-fns/locale");
const { query_manager } = require("../Database/_DBManager");
const {
  format,
  subDays,
  subMonths,
  getHours,
  getMinutes,
  isWeekend,
  getDay,
  isSameDay,
  differenceInBusinessDays,
  differenceInDays,
  isAfter,
  isBefore,
} = require("date-fns");

class Core {
  constructor() {
    if (Core.instance instanceof Core) {
      return Core.instance;
    }

    //this means red/hour given timeframe below
    this._perWeekAll = new Map();
    this._perMonthAll = new Map();
    this._perTrimesterAll = new Map();
    this._halfYearALl = new Map();
    this._perYearAll = new Map();

    this._perWeekEmployee = new Map();
    this._perMonthEmployee = new Map();
    this._perTrimesterEmployee = new Map();
    this._halfYearEmployee = new Map();
    this._perYearEmployee = new Map();

    this._total = {
      perHour: 0,
      perWeek: 0,
      perMonth: 0,
      perTrimester: 0,
      halfYear: 0,
    };

    this._dbExecutor = query_manager;

    this.storeHours = { start: 8, end: 17 };

    this.history = null;

    this._product_inventory = null;
    this._activation_history = null;
    this._reduction_history = null;
    this._shipment_history = null;
    this._employees = null;
    this._initFetch();

    Core.instance = this;
  }

  async _initFetch() {
    try {
      console.time("Initialization time");
      await this._loadStoreInfo();
      await this._loadProductInventory();
      await this._loadActivationHistory();
      await this._loadReductionHistory();
      await this._loadShipmentHistory();
      await this._loadEmployees();
      await this._initProcess();
      await this._pushperhourDB();
      await this._loadHistory();
      console.timeEnd("Initialization time");
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }

  async _loadStoreInfo() {
    const info = await this._dbExecutor("system_config").select("*");
    this.storeHours.start = info[0].StoreHours_Start;
    this.storeHours.end = info[0].StoreHours_End;
  }

  async _loadProductInventory() {
    const products = await this._dbExecutor("product_inventory").select("*");
    this._product_inventory = new Map(
      products.map((product) => [product.PRODUCT_ID, product])
    );
  }

  async _loadActivationHistory() {
    const activation_history = await this._dbExecutor("inventory_activation")
      .select("*")
      .whereBetween("DATE", [
        new Date().setDate(new Date().getDate() - 380),
        new Date(),
      ])
      .orderBy("DATE", "desc");
    this._activation_history = activation_history.map((activation) => ({
      ...activation,
    }));
  }

  async _loadReductionHistory() {
    const reduction_history = await this._dbExecutor("inventory_consumption")
      .select("*")
      .whereBetween("DATETIME", [
        new Date().setDate(new Date().getDate() - 380),
        new Date(),
      ])
      .orderBy("DATETIME", "desc");
    this._reduction_history = reduction_history.map((reduction) => ({
      ...reduction,
    }));
  }

  async _loadShipmentHistory() {
    const shipment_history = await this._dbExecutor("shipment_log")
      .select("*")
      .whereBetween("SHIPMENT_DATE", [
        new Date().setDate(new Date().getDate() - 380),
        new Date(),
      ])
      .orderBy("SHIPMENT_DATE", "desc");
    this._shipment_history = shipment_history.map((shipment) => ({
      ...shipment,
    }));
  }

  async _loadEmployees() {
    const employeeDataStruct = {
      activation: new Array(),
      reduction: new Array(),
      shipment: new Array(),
    };
    const employees = await this._dbExecutor("employee").select("*");
    this._employees = new Map(
      employees.map((emp) => [emp.EMPLOYEE_ID, { ...employeeDataStruct, emp }])
    );
    for (const activation of this._activation_history) {
      if (this._employees.has(activation.EMPLOYEE_ID)) {
        const temp = this._employees.get(activation.EMPLOYEE_ID);
        this._employees.set(activation.EMPLOYEE_ID, {
          ...temp,
          activation: [...temp.activation, activation],
        });
      }
    }
    for (const reduction of this._reduction_history) {
      if (this._employees.has(reduction.EMPLOYEE_ID)) {
        const temp = this._employees.get(reduction.EMPLOYEE_ID);
        this._employees.set(reduction.EMPLOYEE_ID, {
          ...temp,
          reduction: [...temp.reduction, reduction],
        });
      }
    }
    for (const shipment of this._shipment_history) {
      if (this._employees.has(shipment.EMPLOYEE_ID)) {
        const temp = this._employees.get(shipment.EMPLOYEE_ID);
        this._employees.set(shipment.EMPLOYEE_ID, {
          ...temp,
          shipment: [...temp.shipment, shipment],
        });
      }
    }
  }
  async _loadHistory() {
    let newHistory = [];
    const metrics = await this._dbExecutor("metrics").select("*");
    const sortMetrics = metrics.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    let counter = 0;
    for (let metric of sortMetrics) {
      let historyStruct = {
        index: counter,
        date: format(new Date(metric.date), "yyyy-MM-dd"),
        globalMetrics: JSON.parse(metric.globalMetrics),
        employeeMetrics: JSON.parse(metric.employeeMetrics),
        totalMetrics: JSON.parse(metric.totalMetrics),
      };
      newHistory.push(historyStruct);
      counter++;
    }
    this.history = newHistory;
  }
  async _initProcess() {
    const currentDate = new Date();
    const timeFrames = {
      perWeek: [subDays(currentDate, 7), currentDate],
      perMonth: [subMonths(currentDate, 1), currentDate],
      perTrimester: [subMonths(currentDate, 3), currentDate],
      halfYear: [subMonths(currentDate, 6), currentDate],
      perYear: [subMonths(currentDate, 12), currentDate],
    };

    this._total = {
      perWeek: 0,
      perMonth: 0,
      perTrimester: 0,
      halfYear: 0,
      perYear: 0,
    };

    let globalMetrics = {
      perWeek: new Map(),
      perMonth: new Map(),
      perTrimester: new Map(),
      halfYear: new Map(),
      perYear: new Map(),
    };

    for (const [employeeId, data] of this._employees) {
      let employeeMetrics = {
        perWeek: new Map(),
        perMonth: new Map(),
        perTrimester: new Map(),
        halfYear: new Map(),
        perYear: new Map(),
      };

      for (const product_id of this._product_inventory.keys()) {
        for (const [key, [start, end]] of Object.entries(timeFrames)) {
          if (!employeeMetrics.hasOwnProperty(key)) {
            console.warn(`Unexpected key: ${key}`);
            continue;
          }

          const metrics = this._calculateMetricsEmployees(
            start,
            end,
            product_id,
            employeeId
          );

          if (!employeeMetrics[key].has(employeeId)) {
            employeeMetrics[key].set(employeeId, new Map());
          }

          employeeMetrics[key].get(employeeId).set(product_id, metrics);

          if (!globalMetrics[key].has(product_id)) {
            globalMetrics[key].set(product_id, 0);
          }

          globalMetrics[key].set(
            product_id,
            parseFloat(globalMetrics[key].get(product_id)) + parseFloat(metrics)
          );
        }
      }

      this._perWeekEmployee.set(employeeId, employeeMetrics.perWeek);
      this._perMonthEmployee.set(employeeId, employeeMetrics.perMonth);
      this._perTrimesterEmployee.set(employeeId, employeeMetrics.perTrimester);
      this._halfYearEmployee.set(employeeId, employeeMetrics.halfYear);
      this._perYearEmployee.set(employeeId, employeeMetrics.perYear);
    }

    // Manually traverse globalMetrics and add to _total and individual global maps
    for (const product_id of this._product_inventory.keys()) {
      if (globalMetrics.perWeek.has(product_id)) {
        const totalPerWeek = globalMetrics.perWeek.get(product_id);
        this._perWeekAll.set(product_id, totalPerWeek.toFixed(2));
        this._total.perWeek += totalPerWeek;
      }
      //calc my be off and might need to devide by emp.size
      if (globalMetrics.perMonth.has(product_id)) {
        const totalPerMonth = globalMetrics.perMonth.get(product_id);
        this._perMonthAll.set(product_id, totalPerMonth.toFixed(2));
        this._total.perMonth += totalPerMonth;
      }

      if (globalMetrics.perTrimester.has(product_id)) {
        const totalPerTrimester = globalMetrics.perTrimester.get(product_id);
        this._perTrimesterAll.set(product_id, totalPerTrimester.toFixed(2));
        this._total.perTrimester += totalPerTrimester;
      }

      if (globalMetrics.halfYear.has(product_id)) {
        const totalHalfYear = globalMetrics.halfYear.get(product_id);
        this._halfYearALl.set(product_id, totalHalfYear.toFixed(2));
        this._total.halfYear += totalHalfYear;
      }
      if (globalMetrics.perYear.has(product_id)) {
        const totalPerYear = globalMetrics.perYear.get(product_id);
        this._perYearAll.set(product_id, totalPerYear.toFixed(2));
        this._total.perYear += totalPerYear;
      }
    }
  }

  isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  _calculateMetricsEmployees(start, end, trackerId, employeeID) {
    let reductionRates = [];
    const employee = this._employees.get(employeeID);

    // Filter entries for the product and activation source
    const employeeEntryFilteredList = employee?.reduction.filter(
      (reduction) =>
        reduction.PRODUCT_ID === trackerId && reduction.ORIGIN === "activation"
    );

    let timeFrameArray = [];
    const numofdays = differenceInDays(end, start);

    // Create an array of days between start and end dates
    for (let i = 0; i < numofdays; i++) {
      timeFrameArray.push({
        date: format(subDays(end, i), "yyyy-MM-dd"),
        recent: null,
        last: null,
        qty: 0,
      });
    }

    // Populate the time frame array with entries per day
    for (let day of timeFrameArray) {
      const dayReductions = employeeEntryFilteredList.filter((entry) =>
        isSameDay(
          new Date(format(entry.DATETIME, "yyyy-MM-dd")),
          new Date(day.date)
        )
      );

      day.qty = dayReductions.reduce((acc, entry) => acc + entry.QUANTITY, 0);
      day.recent =
        dayReductions.length > 0
          ? getHours(new Date(dayReductions[0].DATETIME))
          : null;
      day.last =
        dayReductions.length > 0
          ? getHours(new Date(dayReductions[dayReductions.length - 1].DATETIME))
          : null;
    }

    let accumulatedHours = 0;
    let recent = null;
    let last = null;
    const currentDate = end;
    let startDayIsNullCheck = timeFrameArray[0].qty === 0;

    // Calculate reduction rates
    for (let i = 0; i < timeFrameArray.length; i++) {
      const currentDay = new Date(timeFrameArray[i].date + "T00:00:00");

      // Skip weekends
      if (isWeekend(currentDay)) {
        continue;
      }

      // Handle the first entry
      if (i === 0) {
        recent = timeFrameArray[i].recent;
        last = timeFrameArray[i].last;
        continue;
      }

      // Handle start day with no quantity
      if (startDayIsNullCheck && timeFrameArray[i].qty !== 0) {
        recent = timeFrameArray[i].recent;
        last = timeFrameArray[i].last;
        const days = differenceInBusinessDays(
          currentDate,
          new Date(timeFrameArray[i].date)
        );
        const hours = days * (this.storeHours.end - this.storeHours.start);
        reductionRates.push(timeFrameArray[i].qty / hours);
        startDayIsNullCheck = false;
        continue;
      }

      // Accumulate hours for non-start days
      if (!startDayIsNullCheck && timeFrameArray[i].qty === 0) {
        accumulatedHours += this.storeHours.end - this.storeHours.start;
        continue;
      }

      // Handle non-zero quantity days
      if (timeFrameArray[i].qty !== 0) {
        const starthourdiff = last - this.storeHours.start || 0;
        const endhourdiff = this.storeHours.end - timeFrameArray[i].recent || 0;
        const hours = accumulatedHours + starthourdiff + endhourdiff;
        reductionRates.push(timeFrameArray[i].qty / hours);
        recent = timeFrameArray[i].recent;
        last = timeFrameArray[i].last;
        accumulatedHours = 0;
      }
    }

    // Calculate the average reduction rate
    const averageReductionRate =
      reductionRates.reduce((acc, rate) => acc + rate, 0) /
      reductionRates.length;

    if (isNaN(averageReductionRate)) return 0;

    // Return the average reduction rate, rounded to 2 decimal places
    return Math.abs(averageReductionRate).toFixed(2);
  }

  //accessor functions

  _getAllMetrics() {
    let output = {
      perHourWeekTimeFrame: [],
      perHourMonthTimeFrame: [],
      perHourTrimesterTimeFrame: [],
      perHourHalfYearTimeFrame: [],
      perHourYearTimeFrame: [],

      //employee
      employeeRates: [],

      perHourWholeStore: this._total,
    };

    for (const [product_id, total] of this._perWeekAll) {
      output.perHourWeekTimeFrame.push({ product_id, total });
    }
    for (const [product_id, total] of this._perMonthAll) {
      output.perHourMonthTimeFrame.push({ product_id, total });
    }
    for (const [product_id, total] of this._perTrimesterAll) {
      output.perHourTrimesterTimeFrame.push({ product_id, total });
    }
    for (const [product_id, total] of this._halfYearALl) {
      output.perHourHalfYearTimeFrame.push({ product_id, total });
    }
    for (const [product_id, total] of this._perYearAll) {
      output.perHourYearTimeFrame.push({ product_id, total });
    }

    for (const [key, value] of this._employees) {
      let employeeMetrics = {
        employeeId: key,
        perWeek: [],
        perMonth: [],
        perTrimester: [],
        halfYear: [],
        perYear: [],
      };
      for (const [id, rate] of this._perWeekEmployee.get(key)) {
        for (const [product_id, total] of rate) {
          employeeMetrics.perWeek.push({ product_id, total });
        }
      }
      for (const [id, rate] of this._perMonthEmployee.get(key)) {
        for (const [product_id, total] of rate) {
          employeeMetrics.perMonth.push({ product_id, total });
        }
      }
      for (const [id, rate] of this._perTrimesterEmployee.get(key)) {
        for (const [product_id, total] of rate) {
          employeeMetrics.perTrimester.push({ product_id, total });
        }
      }
      for (const [id, rate] of this._halfYearEmployee.get(key)) {
        for (const [product_id, total] of rate) {
          employeeMetrics.halfYear.push({ product_id, total });
        }
      }
      for (const [id, rate] of this._perYearEmployee.get(key)) {
        for (const [product_id, total] of rate) {
          employeeMetrics.perYear.push({ product_id, total });
        }
      }
      output.employeeRates.push(employeeMetrics);
    }
    return output;
    //bundle all metrics
  }
  _getEmployeeMetricsById(employee) {
    let output = {
      employeeId: employee,
      perWeek: [],
      perMonth: [],
      perTrimester: [],
      halfYear: [],
      perYear: [],
    };
    for (const [id, rate] of this._perWeekEmployee.get(employee)) {
      for (const [product_id, total] of rate) {
        output.perWeek.push({ product_id, total });
      }
    }
    for (const [id, rate] of this._perMonthEmployee.get(employee)) {
      for (const [product_id, total] of rate) {
        output.perMonth.push({ product_id, total });
      }
    }
    for (const [id, rate] of this._perTrimesterEmployee.get(employee)) {
      for (const [product_id, total] of rate) {
        output.perTrimester.push({ product_id, total });
      }
    }
    for (const [id, rate] of this._halfYearEmployee.get(employee)) {
      for (const [product_id, total] of rate) {
        output.halfYear.push({ product_id, total });
      }
    }
    for (const [id, rate] of this._perYearEmployee.get(employee)) {
      for (const [product_id, total] of rate) {
        output.perYear.push({ product_id, total });
      }
    }
    return output;
  }
  _getGlobalMetrics() {
    let output = {
      perHourWeekTimeFrame: [],
      perHourMonthTimeFrame: [],
      perHourTrimesterTimeFrame: [],
      perHourHalfYearTimeFrame: [],
      perHourYearTimeFrame: [],
    };
    for (const [product_id, total] of this._perWeekAll) {
      output.perHourWeekTimeFrame.push({ product_id, total });
    }
    for (const [product_id, total] of this._perMonthAll) {
      output.perHourMonthTimeFrame.push({ product_id, total });
    }
    for (const [product_id, total] of this._perTrimesterAll) {
      output.perHourTrimesterTimeFrame.push({ product_id, total });
    }
    for (const [product_id, total] of this._halfYearALl) {
      output.perHourHalfYearTimeFrame.push({ product_id, total });
    }
    for (const [product_id, total] of this._perYearAll) {
      output.perHourYearTimeFrame.push({ product_id, total });
    }
    return output;
  }
  _getTotalMetrics() {
    return this._total;
  }
  generateRandomID = (length) => {
    // Create a random ID with a specified length
    let result = "";
    // Define the characters that can be included in the ID
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      // Append a random character from the characters string
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  async _pushperhourDB() {
    const generateTransID = this.generateRandomID(14);
    const metrics = this._getAllMetrics();
    try {
      //init entry
      const currentDate = new Date();
      const formatCurrentDate = format(currentDate, "yyyy-MM-dd");
      const check = await this._dbExecutor.raw(
        "SELECT * FROM metrics where DATE(date) = ?",
        formatCurrentDate
      );
      if (check[0].length > 0) {
        return;
      }

      //employee metrics for each employee month

      let employeeMonth = metrics.employeeRates.map((employee) => {
        return {
          employeeId: employee.employeeId,
          perMonth: employee.perMonth,
        };
      });
      await this._dbExecutor("metrics").insert({
        metricID: generateTransID,
        date: new Date(),
        globalMetrics: JSON.stringify({
          perHourMonthTimeFrame: metrics.perHourMonthTimeFrame,
        }),
        employeeMetrics: JSON.stringify(employeeMonth),
        totalMetrics: JSON.stringify(metrics.perHourWholeStore),
      });
    } catch (error) {
      console.error("Error pushing to DB", error);
    }
  }

  //create a by timeFrame function so that we can minimize the amount of data we are pulling and increase performance
  //increase filtering to reduce the amount of data we are pulling to perTrimester? or perMonth idk maybe allow user to specify

  async getDBMETRICSEMPLOYEEbyDate(rangeStart, rangeEnd) {
    let start = format(new Date(rangeStart + "T00:00:00"), "yyyy-MM-dd");
    let end = format(new Date(rangeEnd + "T00:00:00"), "yyyy-MM-dd");
    let historyOutput = [];
    const isSame = isSameDay(start, end);
    if (isSame) {
      const filterHistory = this.history.filter((history) => {
        return isSameDay(new Date(history.date), start);
      });
      if (filterHistory.length === 0) {
        return [];
      }

      for (let metric of filterHistory) {
        let historyStruct = {
          date: metric.date,
          employeeMetrics: metric.employeeMetrics,
        };

        historyOutput.push(historyStruct);
      }
      return historyOutput;
    }
    const filterHistory = this.history.filter((history) => {
      if (isSameDay(new Date(history.date), start)) {
        return { ...history };
      }
      if (isSameDay(new Date(history.date), end)) {
        return { ...history };
      }
      if (
        isAfter(new Date(history.date), start) &&
        isBefore(new Date(history.date), end)
      ) {
        return { ...history };
      }
      ``;
    });
    if (filterHistory.length === 0) {
      return [];
    }
    for (let metric of filterHistory) {
      let historyStruct = {
        date: metric.date,
        employeeMetrics: metric.employeeMetrics,
      };
      historyOutput.push(historyStruct);
    }
    return historyOutput;
  }

  async getDBMETRICSGLOBALbyDate(rangeStart, rangeEnd) {
    let start = format(new Date(rangeStart + "T00:00:00"), "yyyy-MM-dd");
    let end = format(new Date(rangeEnd + "T00:00:00"), "yyyy-MM-dd");
    let historyOutput = [];

    const isSame = isSameDay(start, end);
    if (isSame) {
      const metrics = this.history.filter((history) => {
        return isSameDay(new Date(history.date), start);
      });
      if (metrics.length === 0) {
        return [];
      }
      for (let metric of filterHistory) {
        let historyStruct = {
          date: metric.date,
          globalMetrics: metric.globalMetrics,
        };
        historyOutput.push(historyStruct);
      }
      return historyOutput;
    }
    const metrics = this.history.filter((history) => {
      if (isSameDay(new Date(history.date), start)) {
        return { ...history };
      }
      if (isSameDay(new Date(history.date), end)) {
        return { ...history };
      }
      if (
        isAfter(new Date(history.date), start) &&
        isBefore(new Date(history.date), end)
      ) {
        return { ...history };
      }
    });
    if (metrics.length === 0) {
      return [];
    }
    for (let metric of filterHistory) {
      let historyStruct = {
        date: metric.date,
        globalMetrics: metric.globalMetrics,
      };
      historyOutput.push(historyStruct);
    }
    return historyOutput;
  }

  async getDBMETRICSTOTALbyDate(rangeStart, rangeEnd) {
    let start = format(new Date(rangeStart + "T00:00:00"), "yyyy-MM-dd");
    let end = format(new Date(rangeEnd + "T00:00:00"), "yyyy-MM-dd");
    let historyOutput = [];

    const isSame = isSameDay(start, end);
    if (isSame) {
      const metrics = this.history.filter((history) => {
        return isSameDay(new Date(history.date), start);
      });
      if (metrics.length === 0) {
        return [];
      }
      metrics.forEach((metric) => {
        let historyStruct = {
          date: metric.date,
          totalMetrics: metric.totalMetrics,
        };
        historyOutput.push(historyStruct);
      });
      return historyOutput;
    }

    const metrics = this.history.filter((history) => {
      if (isSameDay(new Date(history.date), start)) {
        return { ...history };
      }
      if (isSameDay(new Date(history.date), end)) {
        return { ...history };
      }
      if (
        isAfter(new Date(history.date), start) &&
        isBefore(new Date(history.date), end)
      ) {
        return { ...history };
      }
    });
    if (metrics.length === 0) {
      return [];
    }

    metrics.forEach((metric) => {
      let historyStruct = {
        date: metric.date,
        totalMetrics: metric.totalMetrics,
      };
      historyOutput.push(historyStruct);
    });

    return historyOutput;
  }

  async getDBMETRICSByDate(rangeStart, rangeEnd) {
    let historyOutput = [];
    const start = format(new Date(rangeStart + "T00:00:00"), "yyyy-MM-dd");
    const end = format(new Date(rangeEnd + "T00:00:00"), "yyyy-MM-dd");
    const isSame = isSameDay(start, end);
    if (isSame) {
      const metrics = this.history.filter((history) => {
        return isSameDay(new Date(history.date), start);
      });
      if (metrics.length === 0) {
        return [];
      }
      for (let metric of filterHistory) {
        let historyStruct = {
          data: metric.date,
          globalMetrics: metric.globalMetrics,
          employeeMetrics: metric.employeeMetrics,
          totalMetrics: metric.totalMetrics,
        };
        historyOutput.push(historyStruct);
      }
      return historyOutput;
    }

    const metrics = this.history.filter((history) => {
      if (isSameDay(new Date(history.date + "T00:00:00"), new Date(start))) {
        return { ...history };
      }
      if (isSameDay(new Date(history.date + "T00:00:00"), new Date(end))) {
        return { ...history };
      }
      if (
        isAfter(new Date(history.date + "T00:00:00"), new Date(start)) &&
        isBefore(new Date(history.date + "T00:00:00"), new Date(end))
      ) {
        return { ...history };
      }
    });
    if (metrics.length === 0) {
      return [];
    }
    for (let metric of metrics[0]) {
      let historyStruct = {
        data: metric.date,
        globalMetrics: metric.globalMetrics,
        employeeMetrics: metric.employeeMetrics,
        totalMetrics: metric.totalMetrics,
      };
      historyOutput.push(historyStruct);
    }
    return historyOutput;
  }
}

module.exports = new Core();
