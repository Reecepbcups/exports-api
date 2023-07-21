import express from "express";
import controller from "../controllers/data_handler";
const router = express.Router();

router.get("/latestHeight", controller.getLatestHeightFromCompressedFolder);
router.get("/:height/:type", controller.getDecompressedJsonDataByHeightAndType);
router.get(
  "/:height/:type/:address",
  controller.getDecompressedJsonDataByHeightTypeAndAddress
);

export = router;
