export const buildVoteTally = (candidates: string[], votes: any[]) => {
  const tally: Record<string, number> = {};

  for (let i = 0; i < candidates.length; i++) {
    tally[candidates[i]] = 0;
  }

  for (let i = 0; i < votes.length; i++) {
    const vote = votes[i];

    if (typeof tally[vote[3]] !== "undefined") {
      tally[vote[3]] = tally[vote[3]] + 1;
    }
  }

  return tally;
};