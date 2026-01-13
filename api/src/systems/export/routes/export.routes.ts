import { Router } from "express";
import * as exportController from "../controllers/export.controller";

const router = Router();

router.get("/hscodes", exportController.getHSCodes);
router.get("/countries", exportController.getCountries);
router.get("/buyers", exportController.getBuyers);

export default router;
