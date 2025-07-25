/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-24 07:49:28

 temp

*/
// LiveProcessFeed.jsx
// LiveProcessFeed.jsx
import React, { useEffect, useState } from "react";
import { CardStack } from "./ui/CardStack";

// Unique ID counter for keys
let idCounter = 0;

const LiveProcessFeed = () => {
  const [activationCards, setActivationCards] = useState([]);
  const [reductionCards, setReductionCards] = useState([]);
  const [shipmentCards, setShipmentCards] = useState([]);

  const removeCardByTransactionID = (transactionID) => {
    setActivationCards((prev) =>
      prev.filter((card) => card.transactionID !== transactionID)
    );
    setReductionCards((prev) =>
      prev.filter((card) => card.transactionID !== transactionID)
    );
    setShipmentCards((prev) =>
      prev.filter((card) => card.transactionID !== transactionID)
    );
  };
  useEffect(() => {
  let socket;
  let reconnectInterval = 2000; // 2 seconds to start
  let isUnmounted = false;

  const connect = () => {
    socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      reconnectInterval = 2000; // Reset interval on success
    };

    socket.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const data = raw.data || raw;

        if (data?.exchange === "core.process") {
          if (data?.type === "revert") {
            console.log("♻️ Reverted:", data.transactionID);
            removeCardByTransactionID(data.transactionID);
            return;
          }

          const info = data?.info;
          const type = info?.display_type;
          const transactionID =
            type === "reduction type"
              ? info.newTransactionID
              : info.TRANSACTIONID;

          const newCard = {
            id: idCounter++,
            product: info?.PRODUCT_NAME,
            employee: info?.EMPLOYEE_NAME,
            quantity: info?.QUANTITY,
            type,
            chain: data?.productChain || [],
            transactionID,
          };

          if (type === "activation type") {
            setActivationCards((prev) => [newCard, ...prev.slice(0, 2)]);
          } else if (type === "reduction type") {
            setReductionCards((prev) => [newCard, ...prev.slice(0, 2)]);
          } else if (type === "shipment type") {
            setShipmentCards((prev) => [newCard, ...prev.slice(0, 2)]);
          } else {
            console.warn("⚠️ Unrecognized display_type:", type);
          }
        }
      } catch (err) {
        console.error("❌ WebSocket parse error:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("💥 WebSocket error:", err);
      socket.close(); // Trigger onclose
    };

    socket.onclose = () => {
      if (isUnmounted) return;
      console.warn("🔌 WebSocket closed. Attempting to reconnect...");

      setTimeout(() => {
        reconnectInterval = Math.min(reconnectInterval * 2, 10000); // Exponential backoff up to 30s
        connect();
      }, reconnectInterval);
    };
  };

  connect(); // Initial connect

  return () => {
    isUnmounted = true;
    socket.close();
  };
}, []);


  const sectionStyle = {
    borderRadius: "12px",
    padding: "12px",
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    height: "25vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "auto auto",
    gap: "16px",
  };

  const headerStyle = {
    fontWeight: "bold",
    fontSize: "1.1rem",
    marginBottom: "6px",
    textAlign: "center",
    color: "rgba(0,0,0,0.5)",
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={gridStyle}>
        {/* Activation */}
        <div>
          <div style={headerStyle}>Activation</div>
          <div style={sectionStyle}>
            {activationCards.length > 0 ? (
              <CardStack items={activationCards} />
            ) : (
              <span style={{ color: "#777" }}>No activity</span>
            )}
          </div>
        </div>

        {/* Reduction */}
        <div>
          <div style={headerStyle}>Reduction</div>
          <div style={sectionStyle}>
            {reductionCards.length > 0 ? (
              <CardStack items={reductionCards} />
            ) : (
              <span style={{ color: "#777" }}>No activity</span>
            )}
          </div>
        </div>

        {/* Shipment (spans full width) */}
        <div style={{ gridColumn: "1 / span 2" }}>
          <div style={headerStyle}>Shipment</div>
          <div style={sectionStyle}>
            {shipmentCards.length > 0 ? (
              <CardStack items={shipmentCards} />
            ) : (
              <span
                style={{
                  color: "#777",
                }}
              >
                No activity
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveProcessFeed;
