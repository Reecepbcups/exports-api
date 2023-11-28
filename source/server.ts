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
  res.status(200).json({
    chains: {
      "Available": `/chains`,
    },
    routes: {
      "All Heights": `/:chain/heights`,
      "Valid Types": `/:chain/types`,
      "Download Archive": `/:chain/download/:height`,
    },
    general: {
      "Account Info": `/:chain/:height/auth`,
      "All Stakers": `/:chain/:height/staking`,
      Balances: `/:chain/:height/bank`,
      Supply: `/:chain/:height/supply`,
    },
    specific: {
      "Validators Shares": `/:chain/:height/validators`,
      "Specific Delegations": `/:chain/:height/delegations/:valoper_address`,
      "User Specific": `/:chain/:height/:type/:address`,
    },
  });
});

/** Server */
const PORT: any = process.env.PORT ?? 6060;

router.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
