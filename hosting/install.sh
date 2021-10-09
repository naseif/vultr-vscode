#!/bin/bash

apt update
apt install -y nginx certbot python3-certbot-nginx
curl -fsSL https://code-server.dev/install.sh | sh

## Install duckdns (Thanks for whoever wrote this script!)
userHome=$(eval echo ~${USER})
duckPath="$userHome/duckdns"
duckLog="$duckPath/duck.log"
duckScript="$duckPath/duck.sh"

# Main Install ***
domainName=##
mySubDomain="${domainName%%.*}"
duckDomain="${domainName#*.}"
if [ "$duckDomain" != "duckdns.org" ] && [ "$duckDomain" != "$mySubDomain" ] || [ "$mySubDomain" = "" ]
then 
  echo "[Error] Invalid domain name. Program will now quit."
  exit 0
fi
# Get Token value
duckToken=##
# Create duck dir
if [ ! -d "$duckPath" ] 
then
  mkdir "$duckPath"
fi
# Create duck script file
echo "echo url=\"https://www.duckdns.org/update?domains=$mySubDomain&token=$duckToken&ip=\" | curl -k -o $duckLog -K -" > $duckScript
chmod 700 $duckScript
echo "Duck Script file created"
# Create Conjob
# Check if job already exists
checkCron=$( crontab -l | grep -c $duckScript )
if [ "$checkCron" -eq 0 ] 
then
  # Add cronjob
  echo "Adding Cron job for Duck DNS"
  crontab -l | { cat; echo "*/5 * * * * $duckScript"; } | crontab -
fi
# Test Setup

confirmCont=Y
if [ "$confirmCont" != "Y" ] && [ "$confirmCont" != "Yes" ] && [ "$confirmCont" != "" ] && [ "$confirmCont" != "y" ]
then 
  echo "Setup cancelled. Program will now quit."
  exit 0 
fi
# Run now
$duckScript
# Response
duckResponse=$( cat $duckLog )
echo "Duck DNS server response : $duckResponse"
if [ "$duckResponse" != "OK" ]
then
  echo "[Error] Duck DNS did not update correctly. Please check your settings or run the setup again."
else
  echo "Duck DNS setup complete."
fi

cp code-server /etc/nginx/sites-available/code-server
sudo ln -s ../sites-available/code-server /etc/nginx/sites-enabled/code-server
letsEncryptEmail=##
sudo certbot --non-interactive --redirect --agree-tos --nginx -d $domainName -m $letsEncryptEmail
systemctl restart nginx
sudo systemctl enable --now code-server@root
