import React, { useState, useEffect } from "react";
import "./mainView.css";

function MainView() {
  const [time, setTime] = useState(new Date());
  const [data, setData] = useState([]);

  useEffect(() => {
    // Function to fetch data
    const fetchData = async () => {
      try {
        const response = await fetch("http://192.168.1.176:3001/Reductions"); // Replace with your actual API endpoint
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        setData([]);
        console.error("Error fetching data:", error);
      }
    };

    // Initial data fetch
    fetchData();

    // Polling interval set to 1 second
    const intervalId = setInterval(() => {
      fetchData();
    }, 700); // 1000 ms = 1 second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="main-container">
      <div className="top-content">
        <h1 className="header">Recent Reductions</h1>
        <div className="ListCont">
          {data.length === 0 ? (
            <p className="loading">Waiting for server...</p>
          ) : (
            <ul className="horizontal-list">
              {data.map((item, index) => {
                const firstName = item.EMPLOYEE_NAME.split(" ")[0];
                let listClass = "";
                if (index === 0) {
                  listClass = "listItem mostRecent";
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
      <div className="bottom-left">
        <div className="time-view">
          {time.toLocaleTimeString("en-US", {
            timeZone: "America/Los_Angeles",
          })}
        </div>
      </div>
      <div className="bottom-right">
        <h1 className="logo">ZUMA VISUAL</h1>
      </div>
    </div>
  );
}

export default MainView;
