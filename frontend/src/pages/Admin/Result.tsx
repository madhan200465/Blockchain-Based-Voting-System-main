import React, { useEffect, useState } from "react";
import axios from "../../axios";
import Chart from "../../components/Polls/Chart";
import Panel from "../../components/Polls/Panel";

const Result = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    name: "",
    description: "",
    votes: {},
    analytics: { totalVotes: 0, totalVerifiedUsers: 0, participationRate: "0%" }
  });

  useEffect(() => {
    axios.get("/polls/").then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  const resetElection = () => {
    if (window.confirm("WARNING: This will permanently wipe all current election data and results. This action cannot be undone. Are you sure?")) {
      axios
        .post("/polls/reset")
        .then((_) => window.location.reload())
        .catch((err) => console.log({ err }));
    }
  };

  if (loading) return <div className="loading-state">Loading Results...</div>;

  const participationPercent = parseFloat(data.analytics.participationRate);

  return (
    <Panel name={data.name} description={data.description}>
      <>
        <div className="analytics-summary">
          <div className="analytics-card">
            <h4>Total Votes</h4>
            <div className="value">{data.analytics.totalVotes}</div>
          </div>
          <div className="analytics-card">
            <h4>Verified Voters</h4>
            <div className="value">{data.analytics.totalVerifiedUsers}</div>
          </div>
          <div className="analytics-card">
            <h4>Turnout</h4>
            <div className="value">{data.analytics.participationRate}</div>
            <div className="participation-progress">
               <div 
                 className="progress-fill" 
                 style={{ width: `${Math.min(participationPercent, 100)}%` }}
               ></div>
            </div>
          </div>
        </div>

        <Chart votes={data.votes} />

        <div className="dashboard-actions" style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={resetElection}
            className="end-election-button button-primary"
            style={{ minWidth: '200px' }}
          >
            Reset Election
          </button>
        </div>
      </>
    </Panel>
  );
};

export default Result;
