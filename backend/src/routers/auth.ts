import { Router } from "express";
import loginController from "../controllers/auth/login";
import checkController from "../controllers/auth/check";
import logoutController from "../controllers/auth/logout";
import signupController from "../controllers/auth/signup";
import { govtIdUpload } from "../middlewares/upload";

const router = Router();

router.post("/login", loginController);
router.post("/check", checkController);
router.post("/logout", logoutController);
router.post(
	"/signup",
	(req, res, next) => {
		govtIdUpload.single("govtIdFile")(req, res, (error: any) => {
			if (error) {
				return res.status(400).send([error.message || "File upload failed"]);
			}

			return next();
		});
	},
	signupController
);

export default router;
