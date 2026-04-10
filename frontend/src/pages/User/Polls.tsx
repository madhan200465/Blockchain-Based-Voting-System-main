import React, { useState, useEffect, useContext } from "react";
import axios from "../../axios";
import { AuthContext } from "../../contexts/Auth";
import Waiting from "../../components/Waiting";
import Panel from "../../components/Polls/Panel";
import Ballot from "../../components/Polls/Ballot";

const User = () => {
  const [voteState, setVoteStatus] = useState<
    "finished" | "running" | "not-started" | "checking"
  >("checking");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ 
    name: "", 
    description: "", 
    candidates: [] as string[] 
  });
  const [votable, setVotable] = useState("");

  const authContext = useContext(AuthContext);

  useEffect(() => {
    axios
      .get("/polls/status")
      .then((res: any) => {
        setVoteStatus(res.data.status);
      })
      .catch((error: any) => console.log({ error }));
  }, []);

  useEffect(() => {
    if (voteState !== "checking") {
      axios
        .get("/polls/")
        .then((res: any) => {
          setData(res.data);
        })
        .catch((err: any) => {
          console.error("Failed to fetch poll data:", err);
        })
        .finally(() => {
          setLoading(false);
        });

      axios
        .post("/polls/check-voteability", {
          id: authContext.id.toString(),
        })
        .then((res: any) => {
          setVotable(res.data);
        })
        .catch((err: any) => console.log(err));
    }
  }, [voteState, authContext.id]);

  if (loading || voteState === "checking") return <div className="loading-state">Syncing Ballot...</div>;

  if (voteState === "not-started") return <Waiting />;

  return (
    <Panel name={data.name} description={data.description}>
      <>
        {voteState === "running" ? (
          <Ballot
            enableVote={votable === "not-voted"}
            userId={authContext.id}
            userName={authContext.name}
            candidates={data.candidates}
          />
        ) : (
          <div className="status-message card-premium" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="bi bi-clock-history" style={{ fontSize: '3rem', color: '#6366f1', marginBottom: '20px', display: 'block' }}></i>
            <h3 className="title-small">Election Concluded</h3>
            <p className="text-normal">
              Voting has ended for this election. Final results are being verified by the Election Commission.
            </p>
          </div>
        )}
      </>
    </Panel>
  );
};

export default User;
