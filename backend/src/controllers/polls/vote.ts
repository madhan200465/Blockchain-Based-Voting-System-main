import { Request, Response } from "express";
import ElectionContract, { web3 } from "../../web3";
import { User } from "../../entity/User";
import * as yup from "yup";
import { generateVoterId, isValidVoterId, normalizeVoterId } from "../../utils/voterId";

const checkSchema = yup.object({
  body: yup.object({
    id: yup.string().required(),
  }),
});

export const checkVoteability = async (req: Request, res: Response) => {
  try {
    await checkSchema.validate(req);
  } catch (error) {
    return res.status(400).send({ error });
  }

  const { id } = req.body;
  const user = await User.findOne({ where: { id } });
  if (!user) return res.status(404).send("User not found");

  const instance = await ElectionContract.deployed();
  const voters: Array<any> = await instance.getVoters();
  const status: "not-started" | "running" | "finished" =
    await instance.getStatus();

  if (status !== "running") return res.status(400).send("election not running");
  
  // Use citizenshipNumber to check if already voted on blockchain
  if (voters.includes(user.citizenshipNumber)) return res.send("already-voted");

  return res.send("not-voted");
};

const schema = yup.object({
  body: yup.object({
    id: yup.string().required(),
    name: yup.string().min(3).required(),
    candidate: yup.string().min(3).required(),
    voterId: yup
      .string()
      .trim()
      .matches(/^[a-zA-Z0-9]{6,24}$/, "Voter ID must be 6-24 alphanumeric characters")
      .required("Voter ID is required"),
  }),
});

export default async (req: Request, res: Response) => {
  try {
    await schema.validate(req);
  } catch (error: any) {
    return res.status(400).send(error.errors);
  }

  const { id, name, candidate, voterId } = req.body;
  const normalizedInputVoterId = normalizeVoterId(voterId);

  if (!isValidVoterId(normalizedInputVoterId)) {
    return res.status(400).send("Voter ID must be 6-24 alphanumeric characters");
  }

  // 1. Fetch user from DB
  const user = await User.findOne({ where: { id } });
  if (!user) return res.status(404).send("User not found");

  // 2. Check if user is verified
  if (!user.verified) return res.status(401).send("User not verified by Election Commission");

  // Auto-heal legacy records that used non-standard voter identifiers.
  const normalizedUserVoterId = normalizeVoterId(user.voterId);
  if (!isValidVoterId(normalizedUserVoterId)) {
    user.voterId = generateVoterId(user.id);
    await User.save(user);
  }

  // 3. Verify provided voter ID matches verified user voter ID
  if (normalizeVoterId(user.voterId) !== normalizedInputVoterId) {
    return res.status(401).send("Invalid Voter ID Number");
  }

  const accounts = await web3.eth.getAccounts();
  const instance = await ElectionContract.deployed();
  const voters: Array<any> = await instance.getVoters();
  const candidates: Array<any> = await instance.getCandidates();

  // Pillar 2: Blockchain-level deduplication check
  if (voters.includes(user.citizenshipNumber))
    return res.status(400).send("Duplicate Voting Detected: This Voter ID has already cast a ballot.");

  if (!candidates.includes(candidate))
    return res.status(400).send("No such candidate");

  try {
    // Cast vote using citizenshipNumber as the anchor
    await instance.vote(user.citizenshipNumber, name, candidate, {
      from: accounts[0],
    });
    return res.send("successful");
  } catch (error: any) {
    return res.status(500).send("Blockchain Transaction Failed: " + error.message);
  }
};
