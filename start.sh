# start it in a screen

# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
# nvm install v20.5.0

cd /root/exports-api

npm install -g nodemon

screen -S exports-api -dm bash -c "npm i && npm run dev && exec bash"