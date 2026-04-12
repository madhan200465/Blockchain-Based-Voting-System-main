import React, { useState, useEffect, useContext } from "react";
import axios from "../../axios";
import { AuthContext } from "../../contexts/Auth";
import Waiting from "../../components/Waiting";
import Panel from "../../components/Polls/Panel";
import Ballot from "../../components/Polls/Ballot";
import Chart from "../../components/Polls/Chart";
import StatusNotice from "../../components/Polls/StatusNotice";

const User = () => {
  const [voteState, setVoteStatus] = useState<
    "finished" | "running" | "not-started" | "checking"
  >("checking");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ 
    name: "", 
    description: "", 
    candidates: [] as string[],
    votes: {} as Record<string, number>
  });
  const [published, setPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [votable, setVotable] = useState("");

  const authContext = useContext(AuthContext);

  useEffect(() => {
    axios
      .get("/polls/status")
      .then((res: any) => {
        setVoteStatus(res.data.status);
        setPublished(!!res.data.published);
        setPublishedAt(res.data.publishedAt || "");
      })
      .catch((error: any) => console.log({ error }));
  }, []);

  const publishedOn = publishedAt ? new Date(publishedAt).toLocaleString() : "";
  const totalVotes = Object.values(data.votes || {}).reduce(
    (sum, count) => sum + (Number(count) || 0),
    0
  );
  const candidateCount = Object.keys(data.votes || {}).length;

  useEffect(() => {
    if (voteState !== "checking") {
      const requests = [axios.get("/polls/")];

      if (voteState === "running") {
        requests.push(
          axios.post("/polls/check-voteability", {
            id: authContext.id.toString(),
          })
        );
      }

      Promise.all(requests)
        .then((responses) => {
          setData(responses[0].data);

          if (responses[1]) {
            setVotable(responses[1].data);
          }
        })
        .catch((err: any) => {
          if (voteState === "finished" && !published) {
            return;
          }

          console.error("Failed to fetch poll data:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [voteState, authContext.id, published]);

  if (loading || voteState === "checking") return <div className="loading-state">Syncing Ballot...</div>;

  if (voteState === "not-started") return <Waiting />;

  if (voteState === "finished" && !published) {
    return (
      <Panel name="Results under review" description="The commission has ended voting and is verifying the tally before publication.">
        <StatusNotice
          title="Results are not public yet"
          message="Voting has finished. The Election Commission must publish the final results before voters can view them."
        />
      </Panel>
    );
  }

  return (
    <Panel name={data.name} description={data.description}>
      <>
        {voteState === "running" ? (
          <Ballot
            enableVote={votable === "not-voted"}
            userId={authContext.id}
            userName={authContext.name}
            voterId={authContext.voterId}
            candidates={data.candidates}
          />
        ) : (
          <>
            {publishedOn && (
              <div className="published-result-banner card-premium">
                <div className="published-result-main">
                  <h4 className="title-small">Official Result Bulletin</h4>
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
        )}
      </>
    </Panel>
  );
};

export default User;
