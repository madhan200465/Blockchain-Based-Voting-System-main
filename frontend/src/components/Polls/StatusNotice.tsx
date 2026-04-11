import React from "react";

interface StatusNoticeProps {
  title: string;
  message: string;
  iconClass?: string;
  iconColor?: string;
}

const StatusNotice = ({
  title,
  message,
  iconClass = "bi bi-shield-lock-fill",
  iconColor = "#f59e0b",
}: StatusNoticeProps) => {
  return (
    <div className="status-message card-premium" style={{ textAlign: "center", padding: "40px" }}>
      <i
        className={iconClass}
        style={{ fontSize: "3rem", color: iconColor, marginBottom: "20px", display: "block" }}
      ></i>
      <h3 className="title-small">{title}</h3>
      <p className="text-normal">{message}</p>
    </div>
  );
};

export default StatusNotice;