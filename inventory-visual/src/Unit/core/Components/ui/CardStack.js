/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-24 08:50:15

 temp

*/
/* CardStack.js */
"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "motion";

export const CardStack = ({ items }) => {
  const [cards, setCards] = useState(items);
  const containerRef = useRef(null);

  useEffect(() => {
    if (items.length === 0) return;

    const newCard = items[0];
    const prevTop = cards[0];
    if (!prevTop || prevTop.id !== newCard.id) {
      setCards(items);
      requestAnimationFrame(() => {
        const el = containerRef.current?.querySelector(
          `[data-id="${newCard.id}"]`
        );
        if (el) {
          animate(el, { x: [-200, 0], opacity: [0, 1] }, { duration: 0.4 });
        }
      });
    }
  }, [items]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "visible",
        backgroundColor: "transparent",
      }}
    >
      {cards.map((card, index) => {
        const offset = index * 16;
        const scale = 1 - index * 0.05;
        const zIndex = cards.length - index;

        return (
          <div
            key={card.id}
            data-id={card.id}
            style={{
              position: "absolute",
              top: `${offset}px`,
              left: 0,
              width: "100%",
              height: "90%",
              backgroundColor: "#ffffff",
              border: "1px solid #ccc",
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              transform: `scale(${scale})`,
              zIndex,
              padding: "0px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "all 0.3s ease",
              color: "#000000",
              fontFamily: "sans-serif",
            }}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "8px",
                textAlign: "center",
                fontWeight: "bold",
                borderBottom: "1px solid #ddd",
                fontSize: "16px",
              }}
            >
              {card.type === "activation type"
                ? "Activation"
                : card.type === "reduction type"
                ? "Reduction"
                : "Shipment"}
            </div>

            {/* Body with 2 columns */}
            <div
              style={{
                display: "flex",
                padding: "16px",
                flex: "1",
                fontSize: "14px",
                gap: "16px",
              }}
            >
              {/* Left side */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  justifyContent: "space-around",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: "600" }}>
                  {card.product}
                </div>
                <div>👤 {card.employee}</div>
                <div>Quantity: {card.quantity}</div>
              </div>

              {/* Vertical Divider */}
              <div
                style={{
                  width: "1px",
                  backgroundColor: "#ddd",
                  height: "100%",
                }}
              />

              {/* Right side - Product Chain */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  gap: "4px",
                  overflow: "hidden",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  Product Chain:
                </div>
                {card.chain.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "140px",
                      }}
                    >
                      {p.product}
                    </span>
                    <span>Δ {p.stockDiff}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
