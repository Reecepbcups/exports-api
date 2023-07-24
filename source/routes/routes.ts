import express from "express";
import controller from "../controllers/handler";
const router = express.Router();

router.get("/heights", controller.avaliableHeights);
router.get("/types", controller.avaliableTypes);
router.get("/download/:height", controller.download);

router.get("/:height/validators", controller.getValidators);

// /:height can also be /latest
router.get(
  "/:height/delegations/:valoper_address",
  controller.getDelegationsTo,
);

router.get("/:height/:type", controller.getDataAtHeight);

router.get("/:height/:type/:address", controller.getUserAtHeight);

export = router;
