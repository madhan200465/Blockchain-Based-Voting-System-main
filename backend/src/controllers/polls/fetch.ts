import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import ElectionContract from "../../web3";
import { User } from "../../entity/User";

export default async (req: Request, res: Response) => {
  const instance = await ElectionContract.deployed();
  const name = await instance.getElectionName();
  const description = await instance.getElectionDescription();

  const candidates = await instance.getCandidates();
  const votes = await instance.getVotes();

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
    const response: any = {};
    for (let i = 0; i < candidates.length; i++) {
        response[candidates[i]] = 0;
    }

    const totalVotes = votes.length;
    const totalVerifiedUsers = await User.count({ where: { verified: true } });
    const participationRate = totalVerifiedUsers > 0 ? (totalVotes / totalVerifiedUsers) * 100 : 0;

    for (let i = 0; i < votes.length; i++) {
      const vote = votes[i];
      if (typeof response[vote[3]] != "undefined")
        response[vote[3]] = response[vote[3]] + 1;
    }

    return res.send({
      name,
      description,
      votes: response,
      analytics: {
        totalVotes,
        totalVerifiedUsers,
        participationRate: participationRate.toFixed(2) + "%"
      }
    });
  }

  // Voters only get names and candidates
  return res.send({ name, description, candidates });
};
