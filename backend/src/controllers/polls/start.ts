import { Request, Response } from "express";
import * as yup from "yup";
import ElectionContract, { web3 } from "../../web3";
import { initializePublicationState } from "../../utils/electionPublication";

const schema = yup.object({
  body: yup.object({
    name: yup.string().min(1).required(),
    description: yup.string().min(1).required(),
    candidates: yup.array(
      yup.object({
        name: yup.string().min(1),
        info: yup.string().min(1),
      })
    ),
  }),
});

export default async (req: Request, res: Response) => {
  try {
    await schema.validate(req);
  } catch (error: any) {
    return res.status(400).send(error.errors);
  }

  const instance = await ElectionContract.deployed();

  const status = await instance.getStatus();
  if (status !== "not-started")
    return res.status(400).send("election already started or not reset");

  const accounts = await web3.eth.getAccounts();

  await instance.setElectionDetails(req.body.name, req.body.description, {
    from: accounts[0],
  });

  for (let i = 0; i < req.body.candidates.length; i++) {
    const candidate = req.body.candidates[i];
    await instance.addCandidate(candidate.name, candidate.info, {
      from: accounts[0],
    });
  }

  await initializePublicationState();

  return res.send(req.body);
};
