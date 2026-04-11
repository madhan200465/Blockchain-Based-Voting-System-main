import { Request, Response } from "express";
import ElectionContract from "../../web3";
import { publishElectionResults } from "../../utils/electionPublication";

export default async (_: Request, res: Response) => {
  const instance = await ElectionContract.deployed();
  const status = await instance.getStatus();

  if (status !== "finished") {
    return res.status(400).send("election must be finished before publishing results");
  }

  const publication = await publishElectionResults();

  return res.send({
    published: publication.isPublished,
    reviewedAt: publication.reviewedAt,
    publishedAt: publication.publishedAt,
  });
};