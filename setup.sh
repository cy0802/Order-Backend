#!/bin/bash
sudo apt update
sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install

# can run when ssh disconnect
sudo npm install pm2 -g
pm2 start index.js --name "order-backend" --env production
pm2 save
# 設定開機自動執行
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

