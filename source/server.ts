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
    source: {
      export_api: "https://github.com/Reecepbcups/exports-api",
      state_exporter: "https://github.com/Reecepbcups/cosmos-state-exporter"
    },
    routes: {
      chains: `/chains`,
      heights: `/:chain/heights`,
      types: `/:chain/types`,
      download_archive: `/:chain/download/:height`,
    },
    general: {
      account_info: `/:chain/:height/auth`,
      stakers: `/:chain/:height/staking`,
      balances: `/:chain/:height/bank`,
      supply: `/:chain/:height/supply`,
    },
    specific: {
      valiadtor_shares: `/:chain/:height/validators`,
      specific_delegations: `/:chain/:height/delegations/:valoper_address`,
      user_specific: `/:chain/:height/:type/:address`,
    },
  });
});

/** Server */
const PORT: any = process.env.PORT ?? 6060;

router.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
