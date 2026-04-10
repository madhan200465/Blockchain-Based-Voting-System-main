import React from "react";
import axios from "../../axios";

interface BallotProps {
  candidates: string[];
  userId?: number;
  userName?: string;
  enableVote?: boolean;
}

const Ballot = (props: BallotProps) => {
  const vote = (candidate: string) => {
    const voterId = window.prompt(
      "Please enter your Voter ID (Citizenship Number) to confirm your vote:"
    );

    if (!voterId) return;

    axios
      .post("/polls/vote", {
        id: props.userId?.toString(),
        name: props.userName,
        candidate,
        voterId,
      })
      .then((_) => {
        alert("Success: Your vote has been securely recorded on the blockchain!");
        window.location.reload();
      })
      .catch((err) => {
        const errorMsg = err.response?.data || err.message;
        alert("Error: " + errorMsg);
        console.log({ err });
      });
  };

  return (
    <div className="ballot-container">
      <div className="ballot-header">
        <h3 className="title-small">Official Ballot</h3>
        <p className="text-normal">Select your candidate of choice. Your vote is anonymous and final.</p>
      </div>

      <div className="candidates-grid">
        {props.candidates.map((name, index) => (
          <div key={index} className="candidate-card card-premium">
            <div className="candidate-info">
              <div className="candidate-name">{name}</div>
              <div className="candidate-status">Candidate</div>
            </div>
            {props.enableVote ? (
              <button onClick={() => vote(name)} className="button-primary vote-btn">
                Cast Vote
              </button>
            ) : (
                <div className="voted-badge">
                   <i className="bi bi-check-circle-fill"></i> Vote Cast
                </div>
            )}
          </div>
        ))}
      </div>
      
      {!props.enableVote && (
          <div className="post-vote-message">
              <i className="bi bi-shield-check"></i>
              <span>Your vote has been verified and stored in the blockchain registry.</span>
          </div>
      )}
    </div>
  );
};

export default Ballot;
