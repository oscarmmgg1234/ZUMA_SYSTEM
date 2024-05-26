import React, { useState, useEffect, useRef } from "react";
import "./mainView.css";
import { playNotificationSound } from "../../utils/audio";

function MainView() {
  const [time, setTime] = useState(new Date());
  const [reductions, setReductions] = useState([]);
  const [activations, setActivations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notification, setNotification] = useState(null);
  const notificationQueue = useRef([]);
  const [lastShownNotification, setLastShownNotification] = useState({
    reduction: null,
    activation: null,
  });

  useEffect(() => {
    const fetchData = async (endpoint, setState) => {
      try {
        const response = await fetch(endpoint);
        const result = await response.json();
        console.log(`Data fetched successfully from ${endpoint}:`, result);

        if (result.data && Array.isArray(result.data)) {
          setState(result.data);
        } else if (Array.isArray(result)) {
          setState(result);
        } else {
          setState([]);
        }
      } catch (error) {
        setState([]);
        console.error(`Error fetching data from ${endpoint}:`, error);
      }
    };
    const url = `http://192.168.1.176`;
    fetchData(`${url}:3001/Reductions`, setReductions);
    fetchData(`${url}:3001/Activations`, setActivations);
    fetchData(`${url}:3004/productAlerts`, setAlerts);

    const reductionActivationInterval = setInterval(() => {
      fetchData(`${url}:3001/Reductions`, setReductions);
      fetchData(`${url}:3001/Activations`, setActivations);
    }, 850);

    const alertsInterval = setInterval(() => {
      fetchData(`${url}:3004/productAlerts`, setAlerts);
    }, 600000);

    return () => {
      clearInterval(reductionActivationInterval);
      clearInterval(alertsInterval);
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

      if (reductions[0]) {
        const reductionNotification = `Reduction: ${reductions[0].PRODUCT_NAME} by ${reductions[0].EMPLOYEE_NAME}`;
        if (reductionNotification !== lastShownNotification.reduction) {
          newNotifications.push(reductionNotification);
          setLastShownNotification((prev) => ({
            ...prev,
            reduction: reductionNotification,
          }));
        }
      }

      if (activations[0]) {
        const activationNotification = `Activation: ${activations[0].PRODUCT_NAME} by ${activations[0].EMPLOYEE_NAME}`;
        if (activationNotification !== lastShownNotification.activation) {
          newNotifications.push(activationNotification);
          setLastShownNotification((prev) => ({
            ...prev,
            activation: activationNotification,
          }));
        }
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
  );

  const renderAlerts = (data) => (
    <ul className="alerts-list">
      {data.length === 0 ? (
        <p className="loading">No alerts available</p>
      ) : (
        data.map((alert, index) => (
          <li key={index} className="alert-item">
            <p>
              <strong>Product Name:</strong> {alert.NAME}
            </p>
            <p>
              <strong>Stock:</strong> {alert.stock.STOCK}
            </p>
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div className="main-container">
      {notification && (
        <div className="notification-banner">{notification}</div>
      )}
      <div className="left-content">
        <div className="product-alerts">
          <div className="bottom-right">
            <h1 className="logo">ZUMA VISUAL</h1>
          </div>
          <h1 className="header">Product Alerts</h1>
          {renderAlerts(alerts)}
        </div>
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