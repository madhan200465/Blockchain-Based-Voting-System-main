import { Request, Response } from "express";
import { User } from "../../entity/User";

export default async (req: Request, res: Response) => {
  const users = await User.find({
    select: ["id", "name", "citizenshipNumber", "email", "voterId"],
    where: { verified: true, admin: false },
  });

  return res.send({ users });
};
