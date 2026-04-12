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
    <div className="status-message card-premium">
      <i
        className={`${iconClass} status-message-icon`}
        style={{ color: iconColor }}
      ></i>
      <h3 className="title-small">{title}</h3>
      <p className="text-normal">{message}</p>
    </div>
  );
};

export default StatusNotice;