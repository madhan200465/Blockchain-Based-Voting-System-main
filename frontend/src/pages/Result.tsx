import React, { useEffect, useState } from "react";
import axios from "../axios";
import Chart from "../components/Polls/Chart";
import Panel from "../components/Polls/Panel";

const Result = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState({ name: "", description: "", votes: {} });

  useEffect(() => {
    axios
      .get("/polls/")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading-state">Loading Results...</div>;

  if (error)
    return (
      <div className="error-container" style={{ textAlign: "center", padding: "40px" }}>
        <h2 className="title-small">Access Restricted</h2>
        <p className="text-normal">
          Election results are only visible to authorized Commission Members.
        </p>
      </div>
    );

  return (
    <Panel name={data.name} description={data.description}>
      <Chart votes={data.votes} />
    </Panel>
  );
};

export default Result;
