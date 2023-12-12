#!/bin/bash
touch /var/log/post3.log
amazon-linux-extras install epel -y
yum install chromium -y
wget https://gudmed-prod.s3.ap-south-1.amazonaws.com/resources/MANGAL.TTF -P /usr/share/fonts/dejavu
wget https://gudmed-prod.s3.ap-south-1.amazonaws.com/resources/Roboto-Regular.ttf -P /usr/share/fonts/dejavu
