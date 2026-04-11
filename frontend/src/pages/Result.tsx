import React, { useEffect, useState } from "react";
import axios from "../axios";
import Chart from "../components/Polls/Chart";
import Panel from "../components/Polls/Panel";
import StatusNotice from "../components/Polls/StatusNotice";

const Result = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ name: "", description: "", votes: {} });
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

  return (
    <Panel name={data.name} description={data.description}>
      <>
        {publishedOn && (
          <div className="status-message card-premium" style={{ marginBottom: '20px', textAlign: 'center', padding: '14px' }}>
            <p className="text-normal" style={{ marginBottom: 0 }}>
              Published on: {publishedOn}
            </p>
          </div>
        )}
        <Chart votes={data.votes} />
      </>
    </Panel>
  );
};

export default Result;
