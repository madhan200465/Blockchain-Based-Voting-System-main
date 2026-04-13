import { Router } from "express";
import notVerifiedController from "../controllers/users/not-verified";
import verifiedController from "../controllers/users/verified";
import previewController from "../controllers/users/preview";
import verifyController from "../controllers/users/verify";
import revokeController from "../controllers/users/revoke";
import deleteController from "../controllers/users/delete";

import { adminOnly } from "../middlewares/auth";

const router = Router();

router.use(adminOnly);

router.get("/all", notVerifiedController);
router.get("/verified", verifiedController);
router.get("/preview/:id", previewController);
router.post("/verify", verifyController);
router.post("/revoke", revokeController);
router.delete("/delete/:id", deleteController);

export default router;
