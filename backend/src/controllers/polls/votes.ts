import { Request, Response } from "express";
import ElectionContract from "../../web3";
import { buildVoteTally } from "../../utils/voteTally";

export default async (_: Request, res: Response) => {
  const instance = await ElectionContract.deployed();

  const candidates = await instance.getCandidates();
  const votes = await instance.getVotes();

  const response = buildVoteTally(candidates, votes);

  return res.send({ votes: response });
};
