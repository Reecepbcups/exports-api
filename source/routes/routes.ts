import express from "express";
import controller from "../controllers/handler";
const router = express.Router();

router.get("/chains", controller.availableChains);

router.get("/:chain/heights", controller.availableHeights);
router.get("/:chain/types", controller.availableTypes);
router.get("/:chain/download/:height", controller.download);

router.get("/:chain/:height/validators", controller.getValidators);

// /:height can also be /latest
router.get(
  "/:chain/:height/delegations/:valoper_address",
  controller.getDelegationsTo,
);

router.get("/:chain/:height/:type", controller.getDataAtHeight);

router.get("/:chain/:height/:type/:address", controller.getUserAtHeight);

export = router;
