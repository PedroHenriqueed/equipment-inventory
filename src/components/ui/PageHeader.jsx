import React from "react";

export default function PageHeader({ title }) {
  return (
    <h1
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        color: "#ffffff",
        margin: 0,
      }}
    >
      {title}
    </h1>
  );
}
