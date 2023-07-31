import express, { Express } from "express";
import morgan from "morgan";
import routes from "./routes/routes";

import cors from 'cors';

const router: Express = express();

/** Logging */
router.use(morgan("dev"));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());
/** CORS */
router.use(cors());

/** Routes */

router.use("/", routes);

router.use((req, res, next) => {
  // const urlStart = `${req.protocol}://${req.get("host")}`;

  res.status(200).json({
    routes: {
      "All Heights": `/heights`,
      "Valid Types": `/types`,
      "Download Archive": `/download/:height`,
    },
    general: {
      "Account Info": `/:height/auth`,
      "All Stakers": `/:height/staking`,
      Balances: `/:height/bank`,
      Supply: `/:height/supply`,
    },
    specific: {
      "Validators Shares": `/:height/validators`,
      "Specific Delegations": `/:height/delegations/:valoper_address`,
      "User Specific": `/:height/:type/:address`,
    },
  });
});

/** Server */
const PORT: any = process.env.PORT ?? 6060;

router.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
