import React from "react";
import axios from "../../axios";

interface ChartProps {
  votes: any;
  enableVote?: boolean;
  userId?: number;
  userName?: string;
  showResults?: boolean;
}

const Chart = (props: ChartProps) => {
  const showResults = props.showResults ?? true;
  const votes = props.votes;

  const getButtons = () => {
    const names = [];

    const vote = (candidate: string) => {
      const voterId = window.prompt("Please enter your Voter ID (Citizenship Number) to verify your vote:");

      if (!voterId) return;

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

    for (const name in votes) {
      names.push(
        <button
          onClick={() => vote(name)}
          key={name}
          className="button-wrapper text-normal"
        >
          vote
        </button>
      );
    }

    return names;
  };

  const getNames = () => {
    const names = [];

    for (const name in votes) {
      names.push(
        <div key={name} className="name-wrapper text-normal">
          {name}
        </div>
      );
    }

    return names;
  };

  const getTotal = () => {
    let total = 0;

    for (const name in votes) {
      total += parseInt(votes[name]);
    }

    return total;
  };

  const getBars = () => {
    const bars = [];
    const total = getTotal();

    if (total === 0) return null;

    for (const name in votes) {
      const count = votes[name];
      bars.push(
        <div key={name} className="bar-wrapper">
          <div
            style={{
              height: count != 0 ? `${(count * 100) / total}%` : "auto",
              border: "2px solid #4daaa7",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              color: "white",
              backgroundColor: "rgb(77, 170, 167)",
              paddingBottom: 10,
              paddingTop: 10,
            }}
          >
            {votes[name]}
          </div>
        </div>
      );
    }

    return bars;
  };

  return (
    <div>
      <div className="bars-container">{getBars()}</div>
      <div className="names-wrapper">{getNames()}</div>

      {props.enableVote ? (
        <div className="buttons-wrapper">{getButtons()}</div>
      ) : null}
    </div>
  );
};

export default Chart;
