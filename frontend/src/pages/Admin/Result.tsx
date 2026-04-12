import React, { useEffect, useState } from "react";
import axios from "../../axios";
import Chart from "../../components/Polls/Chart";
import Panel from "../../components/Polls/Panel";

const Result = () => {
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    votes: {},
    analytics: { totalVotes: 0, totalVerifiedUsers: 0, participationRate: "0%" }
  });
  const [publication, setPublication] = useState({
    published: false,
    reviewedAt: "",
    publishedAt: ""
  });

  const publishedOn = publication.publishedAt
    ? new Date(publication.publishedAt).toLocaleString()
    : "";

  useEffect(() => {
    Promise.all([axios.get("/polls/"), axios.get("/polls/status")])
      .then(([pollsRes, statusRes]) => {
        setData(pollsRes.data);
        setPublication({
          published: !!statusRes.data.published,
          reviewedAt: statusRes.data.reviewedAt || "",
          publishedAt: statusRes.data.publishedAt || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const publishResults = () => {
    setPublishing(true);
    axios
      .post("/polls/publish")
      .then((res) => {
        setPublication({
          published: !!res.data.published,
          reviewedAt: res.data.reviewedAt || "",
          publishedAt: res.data.publishedAt || "",
        });
      })
      .catch((err) => console.log({ err }))
      .finally(() => setPublishing(false));
  };

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
        <div className="status-message card-premium status-message-compact">
          <h4 className="title-small">
            {publication.published ? "Results are public" : "Commission review only"}
          </h4>
          <p className="text-normal">
            {publication.published
              ? "Voters can now see the final result summary."
              : "Only commission members can see the tally until the results are published."}
          </p>
          {publication.published && publishedOn && (
            <p className="text-normal muted-meta">
              Published on: {publishedOn}
            </p>
          )}
        </div>

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

        <div className="dashboard-actions">
          <button
            onClick={publishResults}
            className="button-secondary"
            disabled={publishing || publication.published}
          >
            {publication.published ? "Results Published" : publishing ? "Publishing..." : "Publish Results"}
          </button>
          <button
            onClick={resetElection}
            className="end-election-button button-primary"
          >
            Reset Election
          </button>
        </div>
      </>
    </Panel>
  );
};

export default Result;
