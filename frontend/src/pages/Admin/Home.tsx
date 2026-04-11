import React, { useEffect, useState } from "react";
import { RouteProps } from "react-router";
import axios from "../../axios";
import StartPage from "./Start";
import PollsPage from "./Polls";
import ResultPage from "./Result";

const Home = (props: RouteProps): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<"not-started" | "running" | "finished">(
    "not-started"
  );
  const [published, setPublished] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/polls/status")
      .then((res) => {
        setStatus(res.data.status);
        setPublished(!!res.data.published);
        setLoading(false);
      })
      .catch((error) => console.log({ error }));
  }, []);

  if (loading) return <div className="loading-state">Loading Committee Dashboard...</div>;

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h2 className="title-small">Election Commission Dashboard</h2>
        <p className="text-normal">
          Status: <span className={`status-badge ${status}`}>{status}</span>
          {status === "finished" && (
            <span style={{ marginLeft: "10px", color: published ? "#14b8a6" : "#f59e0b" }}>
              {published ? "public" : "review only"}
            </span>
          )}
        </p>
      </div>

      <div className="dashboard-content">
        {status === "finished" && <ResultPage />}
        {status === "running" && <PollsPage />}
        {status === "not-started" && <StartPage />}
      </div>
    </div>
  );
};

export default Home;
