import React, { useState, useEffect, useRef, Suspense } from "react";
import "./mainView.css";
import {
  playNotificationSound,
  playConnectedSound,
  playDisconnectedSound,
} from "../../utils/audio";
import { format, subDays } from "date-fns";
import ChartComponent from "./Components/EmployeeChart";
import TopProductsChart from "./Components/ProductChart";

const metrics_base_url = "http://192.168.1.209:3002";

function MainView() {
  const [time, setTime] = useState(new Date());
  const [reductions, setReductions] = useState([]);
  const [activations, setActivations] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [notification, setNotification] = useState(null);
  const notificationQueue = useRef([]);
  const shownReductionNotifications = useRef(new Set());
  const shownActivationNotifications = useRef(new Set());
  const [chartEmployeeData, setEmployeeChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showEmployeeChart, setShowEmployeeChart] = useState(true);
  const previousStatuses = useRef([]);

  const getMetricsHistory = async (params, option) => {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const baseEnpoint = "/metrics";
    let accesspoint = "";
    if (option === "employee") {
      accesspoint = "/employee";
    }
    if (option === "total") {
      accesspoint = "/total";
    }
    if (option === "global") {
      accesspoint = "/global";
    }

    const response = await fetch(
      `${metrics_base_url}${baseEnpoint}${accesspoint}/${params[0]}/${params[1]}`,
      options
    );
    return await response.json();
  };

  const getEmployeeMetrics = async () => {
    const weeklyStart = currentDate;
    let weeklyEnd = currentDate;
    const getDay = currentDate.getDay();

    if (getDay === 0) {
      weeklyEnd = subDays(currentDate, 6);
    } else if (getDay === 6) {
      weeklyEnd = subDays(currentDate, 5);
    } else if (getDay === 1) {
      weeklyEnd = currentDate;
    } else {
      weeklyEnd = subDays(currentDate, getDay - 1);
    }

    const metrics = await getMetricsHistory(
      [format(weeklyEnd, "yyyy-MM-dd"), format(weeklyStart, "yyyy-MM-dd")],
      "employee"
    );
    console.log("Fetched employee metrics:", metrics);
    setEmployeeChartData(metrics.chartReadyData);
    setTopProducts(metrics.productChartData);
  };

  const scheduleDailyFetch = () => {
    const now = new Date();
    const next4am = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + (now.getHours() >= 4 ? 1 : 0),
      4,
      0,
      0,
      0
    );
    const timeUntilNext4am = next4am - now;

    setTimeout(() => {
      getEmployeeMetrics();
      setInterval(getEmployeeMetrics, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    }, timeUntilNext4am);
  };

  useEffect(() => {
    scheduleDailyFetch();
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await getEmployeeMetrics();
      setLoading(false);
    };
    init();
  }, [currentDate]);

  useEffect(() => {
    const fetchData = async (endpoint, setState) => {
      try {
        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.data && Array.isArray(result.data)) {
          setState(result.data);
        } else if (Array.isArray(result)) {
          setState(result);
        } else {
          setState([]);
        }
      } catch (error) {
        setState([]);
      }
    };

    const fetchScanners = async () => {
      try {
        const response = await fetch("http://192.168.1.176:3001/get_scanners");
        const result = await response.json();
        setScanners(result.scanners);
      } catch (error) {
        console.error(`Error fetching scanners:`, error);
      }
    };

    const url = `http://192.168.1.176`;
    fetchData(`${url}:3001/Reductions`, setReductions);
    fetchData(`${url}:3001/Activations`, setActivations);

    fetchScanners();

    const reductionActivationInterval = setInterval(() => {
      fetchData(`${url}:3001/Reductions`, setReductions);
      fetchData(`${url}:3001/Activations`, setActivations);
    }, 850);

    const scannersInterval = setInterval(fetchScanners, 500);

    return () => {
      clearInterval(reductionActivationInterval);

      clearInterval(scannersInterval);
    };
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const checkForUpdates = () => {
      const newNotifications = [];

      if (
        reductions[0] &&
        !shownReductionNotifications.current.has(reductions[0].CONSUMP_ID)
      ) {
        const reductionNotification = `Reduction: ${reductions[0].PRODUCT_NAME} by ${reductions[0].EMPLOYEE_NAME}`;
        newNotifications.push(reductionNotification);
        shownReductionNotifications.current.add(reductions[0].CONSUMP_ID);
      }

      if (
        activations[0] &&
        !shownActivationNotifications.current.has(activations[0].ACTIVATION_ID)
      ) {
        const activationNotification = `Activation: ${activations[0].PRODUCT_NAME} by ${activations[0].EMPLOYEE_NAME}`;
        newNotifications.push(activationNotification);
        shownActivationNotifications.current.add(activations[0].ACTIVATION_ID);
      }

      if (newNotifications.length > 0) {
        notificationQueue.current.push(...newNotifications);
        if (!notification) {
          showNextNotification();
        }
      }
    };

    checkForUpdates();
  }, [reductions, activations]);

  useEffect(() => {
    const chartInterval = setInterval(() => {
      setShowEmployeeChart((prev) => !prev);
    }, 60000); // 3 minutes in milliseconds
    return () => clearInterval(chartInterval);
  }, []);

  const showNextNotification = () => {
    if (notificationQueue.current.length > 0) {
      const nextNotification = notificationQueue.current.shift();
      setNotification(nextNotification);
      playNotificationSound(); // Play the notification sound
      setTimeout(() => {
        setNotification(null);
        if (notificationQueue.current.length > 0) {
          showNextNotification();
        }
      }, 3000);
    }
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return {
      hours: hours < 10 ? `0${hours}` : `${hours}`,
      minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
      seconds: seconds < 10 ? `0${seconds}` : `${seconds}`,
      ampm,
    };
  };

  useEffect(() => {
    if (previousStatuses.current.length > 0) {
      scanners.forEach((scanner, index) => {
        if (
          scanner.status === 1 &&
          previousStatuses.current[index]?.status !== 1
        ) {
          playConnectedSound();
        } else if (
          scanner.status !== 1 &&
          previousStatuses.current[index]?.status === 1
        ) {
          playDisconnectedSound();
        }
      });
    }

    previousStatuses.current = scanners;
  }, [scanners]);

  const { hours, minutes, seconds, ampm } = formatTime(time);

  const renderList = (data, title) => (
    <div className="section">
      <h1 className="header">{title}</h1>
      <div className="ListCont">
        {data.length === 0 ? (
          <p className="loading">Waiting for server...</p>
        ) : (
          <ul className="horizontal-list">
            {data.map((item, index) => {
              const firstName = item.EMPLOYEE_NAME.split(" ")[0];
              let listClass = "";
              if (index === 0) {
                listClass = "listItem mostRecent animated-border";
              } else if (index === data.length - 1) {
                listClass = "listItem lastItem";
              } else {
                listClass = "listItem pastItem";
              }
              return (
                <li className={listClass} key={index}>
                  <div className="listContent">
                    <p className="listStatus">
                      {index === 0 ? "MOST RECENT" : `PAST ${index}`}
                    </p>
                    <p>
                      <strong>Product:</strong> {item.PRODUCT_NAME}
                    </p>
                    <p>
                      <strong>Employee:</strong> {firstName}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {item.QUANTITY}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  const renderScanners = (data) => (
    <div className="section small-section">
      <h1 className="scannerTitle">Scanners</h1>
      <div className="scanner-list-wrapper">
        {data.map((scanner, index) => (
          <div
            className={`scanner-item ${
              scanner.status === 1 ? "connected" : "disconnected"
            }`}
            key={index}
          >
            <span className="scanner-id">{scanner.label}</span>
            <span
              className={`scanner-status ${
                scanner.status === 1 ? "connected" : "disconnected"
              }`}
            >
              {String.fromCharCode(0x2192)}
            </span>

            <span style={{ color: "white", fontSize: 30, marginLeft: 12 }}>
              {scanner.assigned_employee
                ? scanner.assigned_employee
                : scanner.status === 1
                ? "Not Assigned"
                : "Not Connected"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="main-container">
      {notification && (
        <div className="notification-banner">{notification}</div>
      )}
      <div className="left-content">
        <div className="bottom-right">
          <h1 className="logo">ZUMA VISUAL</h1>
        </div>
        <div className="product-alerts">
          <h2 className="header">Analytics</h2>
          <div style={{ width: "100%", height: "70%" }}>
            <Suspense fallback={<p style={{ color: "grey" }}>loading...</p>}>
              {!loading && (
                <>
                  {showEmployeeChart ? (
                    <ChartComponent
                      data={chartEmployeeData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  ) : (
                    <TopProductsChart data={topProducts} />
                  )}
                </>
              )}
            </Suspense>
          </div>
        </div>

        {renderScanners(scanners)}
        <div className="time-view">
          <div className="digital-clock">
            {hours}:{minutes}:{seconds} {ampm}
          </div>
        </div>
      </div>
      <div className="right-content">
        <div className="content-wrapper">
          {renderList(reductions, "Recent Reductions")}
          {renderList(activations, "Recent Activations")}
        </div>
      </div>
    </div>
  );
}

export default MainView;
