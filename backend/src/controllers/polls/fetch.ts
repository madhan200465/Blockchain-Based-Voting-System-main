import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import ElectionContract from "../../web3";
import { User } from "../../entity/User";
import { getPublicationState } from "../../utils/electionPublication";
import { buildVoteTally } from "../../utils/voteTally";

export default async (req: Request, res: Response) => {
  const instance = await ElectionContract.deployed();
  const name = await instance.getElectionName();
  const description = await instance.getElectionDescription();

  const candidates = await instance.getCandidates();
  const votes = await instance.getVotes();
  const publication = await getPublicationState();

  // Check if admin to show results
  let isAdmin = false;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      if (accessTokenSecret) {
        const user: any = jwt.verify(token, accessTokenSecret);
        isAdmin = !!user.admin;
      }
    } catch (e) {
      // Invalid token, treat as non-admin
    }
  }

  if (isAdmin) {
    const totalVotes = votes.length;
    const totalVerifiedUsers = await User.count({ where: { verified: true } });
    const participationRate = totalVerifiedUsers > 0 ? (totalVotes / totalVerifiedUsers) * 100 : 0;

    return res.send({
      name,
      description,
      votes: buildVoteTally(candidates, votes),
      analytics: {
        totalVotes,
        totalVerifiedUsers,
        participationRate: participationRate.toFixed(2) + "%"
      },
      published: publication.isPublished,
      reviewedAt: publication.reviewedAt,
      publishedAt: publication.publishedAt,
    });
  }

  const status = await instance.getStatus();

  if (status === "finished" && !publication.isPublished) {
    return res.status(403).send("results not published yet");
  }

  if (status === "finished" && publication.isPublished) {
    return res.send({
      name,
      description,
      votes: buildVoteTally(candidates, votes),
      published: true,
    });
  }

  // Voters only get names and candidates
  return res.send({
    name,
    description,
    candidates,
    published: publication.isPublished,
  });
};
