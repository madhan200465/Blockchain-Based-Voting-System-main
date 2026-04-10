import React from "react";
import Chart from "./Chart";

interface PanelProps {
  name: string;
  description: string;
  children: JSX.Element;
}

const Panel = (props: PanelProps) => {
  return (
    <div className="polls-container dashboard-fade-in">
      <div className="panel-header card-premium" style={{ marginBottom: '30px', padding: '30px' }}>
          <div className="header-icon" style={{ fontSize: '2.5rem', color: '#6366f1', marginBottom: '15px' }}>
              <i className="bi bi-box-seam-fill"></i>
          </div>
          <h2 className="title-large" style={{ fontSize: '2rem', marginBottom: '10px' }}>{props.name || "Active Election"}</h2>
          <p className="text-normal" style={{ fontSize: '1.1rem', opacity: 0.8 }}>{props.description || "Official Election Ballot and Information"}</p>
      </div>

      <div className="panel-content">
          {props.children}
      </div>
    </div>
  );
};

export default Panel;
