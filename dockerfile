# Import node.js image from Docker.hub
FROM node:18.16-bullseye 

# Making a WorkDir
WORKDIR /root/carinho

# Copy files to Work DIR
ADD ./app /root/carinho

#Append permissions for crontab
RUN chmod 0644 /root/carinho/filterdata.js

#Upgrade and install cron
RUN apt-get update
RUN apt-get -y install cron

#Configure cron for execute in 3 AM every days 
RUN crontab -l | { cat; echo "* 1 * * * node /root/carinho/filterdata.js"; } | crontab -


#Install NODE.js dependencies 
RUN npm install



# Define Entrypoint
ENTRYPOINT [ "/bin/bash", "-c" ]


# Run cron process and stay on /bin/bash
CMD ["cron && /bin/bash" ]



