import express from "express";
import controller from "../controllers/data_handler";
const router = express.Router();

router.get(
  "/latestHeightInfo",
  controller.getLatestHeightInfoFromCompressedFolder
);
router.get(
  "/latestHeight/:type",
  controller.getLatestHeightDecompressedJsonDataByType
);
router.get(
  "/latestHeight/:type/:address",
  controller.getLatestHeightDecompressedJsonDataByTypeAndAddress
);
router.get("/:height/:type", controller.getDecompressedJsonDataByHeightAndType);
router.get(
  "/:height/:type/:address",
  controller.getDecompressedJsonDataByHeightTypeAndAddress
);

export = router;
