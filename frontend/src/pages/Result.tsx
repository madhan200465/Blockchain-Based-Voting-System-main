import React, { useEffect, useState } from "react";
import axios from "../axios";
import Chart from "../components/Polls/Chart";
import Panel from "../components/Polls/Panel";
import StatusNotice from "../components/Polls/StatusNotice";

const Result = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    name: "",
    description: "",
    votes: {} as Record<string, number>,
  });
  const [published, setPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");

  useEffect(() => {
    Promise.all([axios.get("/polls/status"), axios.get("/polls/")])
      .then(([statusRes, pollRes]) => {
        setPublished(!!statusRes.data.published);
        setPublishedAt(statusRes.data.publishedAt || "");
        setData(pollRes.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading Results...</div>;

  if (!published)
    return (
      <StatusNotice
        title="Results Pending Publication"
        message="The Election Commission has not published the results yet."
      />
    );

  const publishedOn = publishedAt ? new Date(publishedAt).toLocaleString() : "";
  const totalVotes = Object.values(data.votes || {}).reduce(
    (sum, count) => sum + (Number(count) || 0),
    0
  );
  const candidateCount = Object.keys(data.votes || {}).length;

  return (
    <Panel name={data.name} description={data.description}>
      <>
        {publishedOn && (
          <div className="published-result-banner card-premium">
            <div className="published-result-main">
              <h4 className="title-small">Public Result Release</h4>
              <p className="text-normal">Published on: {publishedOn}</p>
            </div>
            <div className="published-result-stats">
              <span className="result-stat-pill">{totalVotes} Total Votes</span>
              <span className="result-stat-pill">{candidateCount} Candidates</span>
            </div>
          </div>
        )}
        <Chart votes={data.votes} />
      </>
    </Panel>
  );
};

export default Result;
