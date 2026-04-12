import React from "react";

interface PanelProps {
  name: string;
  description: string;
  children: JSX.Element;
}

const Panel = (props: PanelProps) => {
  return (
    <div className="polls-container dashboard-fade-in">
      <div className="panel-header card-premium">
          <div className="header-icon">
              <i className="bi bi-box-seam-fill"></i>
          </div>
          <h2 className="title-large">{props.name || "Active Election"}</h2>
          <p className="text-normal">{props.description || "Official Election Ballot and Information"}</p>
      </div>

      <div className="panel-content">
          {props.children}
      </div>
    </div>
  );
};

export default Panel;
