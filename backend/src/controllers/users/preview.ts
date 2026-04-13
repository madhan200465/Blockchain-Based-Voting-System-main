import { Request, Response } from "express";
import { User } from "../../entity/User";

export default async (req: Request, res: Response) => {
  const rawId = String(req.params.id || "").trim();
  const userId = Number(rawId);

  if (!rawId || Number.isNaN(userId) || !Number.isInteger(userId) || userId < 1) {
    return res.status(400).send(["Invalid user id"]);
  }

  const user = await User.findOne({
    select: [
      "id",
      "name",
      "citizenshipNumber",
      "email",
      "phoneNumber",
      "aadhaarNumber",
      "address",
      "govtIdType",
      "govtIdPath",
      "voterId",
      "verified",
      "admin",
    ],
    where: { id: userId, admin: false },
  });

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  const govtIdUrl = user.govtIdPath
    ? `${req.protocol}://${req.get("host")}${user.govtIdPath}`
    : null;

  return res.send({
    user: {
      ...user,
      govtIdUrl,
    },
  });
};