# exports-api
An easy API to get historical data without an archive node

<https://exports.reece.sh>


```json
"routes": {
  "All Heights": "/heights",
  "Valid Types": "/types",
  "Download Archive": "/download/:height"
},
"general": {
  "Account Info": "/:height/auth",
  "All Stakers": "/:height/staking",
  "Balances": "/:height/bank",
  "Supply": "/:height/supply"
},
"specific": {
  "Validators Shares": "/:height/validators",
  "Specific Delegations": "/:height/delegations/:valoper_address",
  "User Specific": "/:height/:type/:address"
}
```
*NOTE* :height can be any numerical value within the /heights endpoint OR "latest" for the latest height
