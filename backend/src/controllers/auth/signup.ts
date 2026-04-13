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
  body: yup
    .object({
      name: yup.string().min(3).required(),
      email: yup.string().transform(emptyStringToUndefined).email().required(),
      govtIdType: yup.string().oneOf(["aadhaar", "voter", "passport", "driving-license", "other"]).required(),
      phoneNumber: yup
        .string()
        .transform(emptyStringToUndefined)
        .matches(/^\+?[0-9]{10,15}$/, "Invalid phone number")
        .required(),
      aadhaarNumber: yup
        .string()
        .transform(emptyStringToUndefined)
        .matches(/^[0-9]{12}$/, "Aadhaar must be 12 digits")
        .required(),
      address: yup.string().transform(emptyStringToUndefined).min(5).required(),
      password: yup.string().min(3).required(),
      citizenshipNumber: yup.string().transform(emptyStringToUndefined).min(4),
    })
    .required(),
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

  const providedCitizenshipNumber = req.body.citizenshipNumber?.trim();
  const providedEmail = req.body.email?.trim().toLowerCase();
  const govtIdType = req.body.govtIdType?.trim();
  const phoneNumber = req.body.phoneNumber?.trim();
  const aadhaarNumber = req.body.aadhaarNumber?.trim();
  const address = req.body.address?.trim();

  // Keep backward compatibility with existing DB schemas that may still require this column.
  const citizenshipNumber = providedCitizenshipNumber || providedEmail;
  const email = providedEmail;

  if (!req.file) {
    return res.status(400).send(["Government ID document is required"]);
  }

  const govtIdPath = `/uploads/govt-ids/${req.file.filename}`;

  newUser.email = email.toLowerCase();
  newUser.govtIdType = govtIdType;
  newUser.govtIdPath = govtIdPath;
  newUser.phoneNumber = phoneNumber;
  newUser.aadhaarNumber = aadhaarNumber;
  newUser.address = address;
  newUser.password = hashedPassword;
  newUser.citizenshipNumber = citizenshipNumber;
  newUser.voterId = null;
  newUser.verified = false;

  try {
    await User.save(newUser);
  } catch (error: any) {
    const errorText = String(error?.message || "").toLowerCase();

    if (errorText.includes("unique") && errorText.includes("email")) {
      return res.status(400).send(["Email is already registered"]);
    }

    if (errorText.includes("unique") && errorText.includes("aadhaarnumber")) {
      return res.status(400).send(["Aadhaar number is already registered"]);
    }

    if (errorText.includes("unique") && errorText.includes("citizenshipnumber")) {
      return res.status(400).send(["This identity is already registered"]);
    }

    if (errorText.includes("not null") && errorText.includes("citizenshipnumber")) {
      return res.status(400).send(["Registration could not be saved due to schema mismatch. Please restart backend and try again."]);
    }

    return res.status(400).send(["Registration failed. Please verify details and try again."]);
  }

  return res.send(newUser);
};
