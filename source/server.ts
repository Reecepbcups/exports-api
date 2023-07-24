import http from "http";
import express, { Express } from "express";
import morgan from "morgan";
import routes from "./routes/routes";

const router: Express = express();

/** Logging */
router.use(morgan("dev"));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

/** RULES OF OUR API */
router.use((req, res, next) => {
  // set the CORS policy
  res.header("Access-Control-Allow-Origin", "*");
  // set the CORS headers
  res.header(
    "Access-Control-Allow-Headers",
    "origin, X-Requested-With,Content-Type,Accept, Authorization",
  );
  // set the CORS method headers
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET");
    return res.status(200).json({});
  }
  next();
});

/** Routes */

router.use("/", routes);

router.use((req, res, next) => {
  const urlStart = `${req.protocol}://${req.get("host")}`;

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
