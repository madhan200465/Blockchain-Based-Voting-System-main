import React from "react";
import axios from "../../axios";

interface ChartProps {
  votes: Record<string, number | string>;
  enableVote?: boolean;
  userId?: number;
  userName?: string;
  showResults?: boolean;
}

const Chart = (props: ChartProps) => {
  const votes = props.votes || {};
  const entries = Object.entries(votes).map(([candidate, count]) => ({
    candidate,
    count: Number(count) || 0,
  }));
  const sortedEntries = [...entries].sort((a, b) => b.count - a.count);
  const totalVotes = sortedEntries.reduce((sum, entry) => sum + entry.count, 0);

  const topCandidate = sortedEntries[0];
  const secondCandidate = sortedEntries[1];
  const isTie =
    !!topCandidate &&
    sortedEntries.filter((entry) => entry.count === topCandidate.count).length > 1;
  const voteMargin =
    topCandidate && secondCandidate ? topCandidate.count - secondCandidate.count : 0;
  const marginPercent =
    totalVotes > 0 ? ((voteMargin * 100) / totalVotes).toFixed(1) : "0.0";

  const getButtons = () => {
    const names = [];

    const vote = (candidate: string) => {
      const voterIdInput = window.prompt(
        "Please enter your Voter ID (alphanumeric, e.g. VOT000123) to verify your vote:"
      );

      const voterId = voterIdInput?.trim().toUpperCase() || "";

      if (!voterId) return;

      if (!/^[A-Z0-9]{6,24}$/.test(voterId)) {
        alert("Invalid Voter ID format. Use 6-24 letters/numbers only.");
        return;
      }

      axios
        .post("/polls/vote", {
          id: props.userId?.toString(),
          name: props.userName,
          candidate,
          voterId,
        })
        .then((_) => {
          alert("Vote Cast Successfully!");
          window.location.reload();
        })
        .catch((err) => {
          const errorMsg = err.response?.data || err.message;
          alert("Error: " + errorMsg);
          console.log({ err });
        });
    };

    for (const entry of sortedEntries) {
      names.push(
        <button
          onClick={() => vote(entry.candidate)}
          key={entry.candidate}
          className="button-wrapper text-normal"
        >
          vote
        </button>
      );
    }

    return names;
  };

  const getBars = () => {
    if (sortedEntries.length === 0 || totalVotes === 0) return null;

    return sortedEntries.map((entry, index) => {
      const height = Math.max((entry.count * 100) / totalVotes, 8);
      const percent = ((entry.count * 100) / totalVotes).toFixed(1);
      const winnerClass = !isTie && index === 0 ? " winner" : "";

      return (
        <div key={entry.candidate} className={`result-column${winnerClass}`}>
          <div className="result-column-track">
            <div
              className="result-column-fill"
              style={{ height: `${height}%` }}
              aria-label={`${entry.candidate}: ${entry.count} votes (${percent}%)`}
            >
              <span className="vote-count">{entry.count}</span>
              <span className="vote-percent">{percent}%</span>
            </div>
          </div>

          <div className="result-meta">
            <span className="result-rank">#{index + 1}</span>
            <span className="result-candidate text-normal">{entry.candidate}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="chart-innovation">
      {totalVotes > 0 && (
        <div className="result-intelligence">
          <div className="insight-card">
            <p className="insight-label">Leading Candidate</p>
            <h3 className="insight-value">
              {isTie ? "Tie" : topCandidate?.candidate || "-"}
            </h3>
          </div>

          <div className="insight-card">
            <p className="insight-label">Lead Margin</p>
            <h3 className="insight-value">
              {isTie ? "0 votes" : `${voteMargin} votes`}
            </h3>
            <p className="insight-subtext">{marginPercent}% of total vote</p>
          </div>

          <div className="insight-card">
            <p className="insight-label">Total Ballots</p>
            <h3 className="insight-value">{totalVotes}</h3>
            <p className="insight-subtext">{sortedEntries.length} candidates</p>
          </div>
        </div>
      )}

      <div className="bars-container">{getBars()}</div>

      {totalVotes === 0 && (
        <div className="status-message card-premium status-message-compact">
          <h4 className="title-small">Results Not Available</h4>
          <p className="text-normal">No validated votes are available yet for charting.</p>
        </div>
      )}

      {props.enableVote ? (
        <div className="buttons-wrapper">{getButtons()}</div>
      ) : null}
    </div>
  );
};

export default Chart;
