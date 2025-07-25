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
import LiveProcessFeed from "./Components/liveProcessFeed";

const metrics_base_url = "http://192.168.1.247:3004";

function MainView() {
  const [time, setTime] = useState(new Date());
  const [scanners, setScanners] = useState([]);
  const [chartEmployeeData, setEmployeeChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showEmployeeChart, setShowEmployeeChart] = useState(true);
  const previousStatuses = useRef([]);

  // WebSocket Listener for other possible channels
  // useEffect(() => {
  //   const ws = new WebSocket("ws://localhost:8080");

  //   ws.onopen = () => console.log("✅ WebSocket connected");

  //   ws.onmessage = (event) => {
  //     const message = JSON.parse(event.data);

  //     if (message.exchange === "core.process") {
  //       console.log("📦 Process event:", message.data);
  //       // LiveProcessFeed handles rendering
  //     } else if (message.exchange === "core.revert") {
  //       console.log("↩️ Revert event:", message.data);
  //     }
  //   };

  //   ws.onclose = () => console.log("❌ WebSocket disconnected");
  //   ws.onerror = (err) => console.error("WebSocket error:", err);

  //   return () => ws.close();
  // }, []);

  const getMetricsHistory = async (params, option) => {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const baseEnpoint = "/metrics";
    let accesspoint = "";
    if (option === "employee") accesspoint = "/employee";
    if (option === "total") accesspoint = "/total";
    if (option === "global") accesspoint = "/global";

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

    if (getDay === 0) weeklyEnd = subDays(currentDate, 6);
    else if (getDay === 6) weeklyEnd = subDays(currentDate, 5);
    else if (getDay !== 1) weeklyEnd = subDays(currentDate, getDay - 1);

    const metrics = await getMetricsHistory(
      [format(weeklyEnd, "yyyy-MM-dd"), format(weeklyStart, "yyyy-MM-dd")],
      "employee"
    );
    if (metrics?.systemLoaded === false) {
      return { systemLoaded: false };
    } else {
      setEmployeeChartData(metrics.chartReadyData);
      setTopProducts(metrics.productChartData);
      return { systemLoaded: true };
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      let isReady = await getEmployeeMetrics();
      while (!isReady.systemLoaded) {
        await new Promise(async (res) => {
          setTimeout(res, 2000);
          isReady = await getEmployeeMetrics();
          res();
        });
      }
      setLoading(false);
    };
    init();
  }, [currentDate]);

  useEffect(() => {
    const fetchScanners = async () => {
      try {
        const response = await fetch("http://192.168.1.247:3001/get_scanners");
        const result = await response.json();
        setScanners(result.scanners);
      } catch (error) {
        console.error("Error fetching scanners:", error);
      }
    };

    fetchScanners();
    const interval = setInterval(fetchScanners, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const chartInterval = setInterval(() => {
      setShowEmployeeChart((prev) => !prev);
    }, 60000);
    return () => clearInterval(chartInterval);
  }, []);

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

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return {
      hours: hours < 10 ? `0${hours}` : `${hours}`,
      minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
      seconds: seconds < 10 ? `0${seconds}` : `${seconds}`,
      ampm,
    };
  };

  const renderScanners = (data) => (
    <div className="section small-section">
      <h1 className="scannerTitle" style={{ color: "black" }}>
        Scanners
      </h1>
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
            <span
              style={{ color: "rgba(0, 0, 0, 0.57)", fontSize: 30, marginLeft: 12 }}
            >
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

  const { hours, minutes, seconds, ampm } = formatTime(time);

  return (
    <div className="main-container">
      <div className="left-content">
        <div className="bottom-right">
          <h1 className="logo">ZUMA VISUAL</h1>
        </div>
        <div className="product-alerts">
          <h2 className="header" style={{ color: "black" }}>
            Analytics
          </h2>
          <div style={{ width: "100%", height: "70%" }}>
            <Suspense fallback={<p style={{ color: "black" }}>loading...</p>}>
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
          <div className="section">
            <h1 className="header" style={{color: "black"}}>Live Inventory Events</h1>
            <div className="ListCont">
              <LiveProcessFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainView;
