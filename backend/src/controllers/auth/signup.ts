import { Request, Response } from "express";
import * as yup from "yup";
import { User } from "../../entity/User";
import bcrypt from "bcrypt";

const emptyStringToUndefined = (value: any, originalValue: any) => {
  if (typeof originalValue === "string" && originalValue.trim() === "") {
    return undefined;
  }

  return value;
};

const schema = yup.object({
  body: yup.object({
    name: yup.string().min(3).required(),
    email: yup.string().transform(emptyStringToUndefined).email(),
    password: yup.string().min(3).required(),
    citizenshipNumber: yup.string().transform(emptyStringToUndefined).min(4).required(),
  }),
});

export default async (req: Request, res: Response) => {
  try {
    await schema.validate(req);
  } catch (error: any) {
    return res.status(400).send(error.errors);
  }

  let hashedPassword = undefined;

  try {
    hashedPassword = await bcrypt.hash(req.body.password, 10);
  } catch (error) {
    return res.status(500).send({ error });
  }

  const newUser = new User();

  newUser.admin = false;
  newUser.name = req.body.name;
  const citizenshipNumber = req.body.citizenshipNumber.trim();
  const email = req.body.email?.trim() || `${citizenshipNumber}@voter.local`;

  newUser.email = email.toLowerCase();
  newUser.password = hashedPassword;
  newUser.citizenshipNumber = citizenshipNumber;
  newUser.verified = false;

  try {
    await User.save(newUser);
  } catch (error) {
    return res.status(400).send(error);
  }

  return res.send(newUser);
};
