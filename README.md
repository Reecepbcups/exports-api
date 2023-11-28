# exports-api
An easy API to get historical data without an archive node.

<https://exports.reece.sh>

**Pairs with** https://github.com/Reecepbcups/cosmos-state-exporter

## Setup

```bash

git clone git@github.com:Reecepbcups/exports-api.git && cd exports-api

cp custom-types.example.json custom-types.json # and modify as needed

# install node if you have not already
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
nvm install v20.5.0

# install nodemon
npm install -g nodemon

# enter into a screen / tmux session (or created a systemd service)
screen -S exports-api -dm bash -c "npm i && npm run dev && exec bash"

# schedule: clear decompressed exports to save space
# (( match the path to .env DECOMPRESSED_ROOT_PATH ))
sudo crontab -e
# 0 0 * * * rm -rf /home/user/path/decompressed_exports/*

```

## View

```json
{
  "chains": {
    "Available": "/chains"
  },
  "routes": {
    "All Heights": "/:chain/heights",
    "Valid Types": "/:chain/types",
    "Download Archive": "/:chain/download/:height"
  },
  "general": {
    "Account Info": "/:chain/:height/auth",
    "All Stakers": "/:chain/:height/staking",
    "Balances": "/:chain/:height/bank",
    "Supply": "/:chain/:height/supply"
  },
  "specific": {
    "Validators Shares": "/:chain/:height/validators",
    "Specific Delegations": "/:chain/:height/delegations/:valoper_address",
    "User Specific": "/:chain/:height/:type/:address"
  }
}
```
*NOTE* :height can be any numerical value within the /heights endpoint OR "latest" for the latest height
