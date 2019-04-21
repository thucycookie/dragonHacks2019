## Development environment:

The entire project is developed on a Linux AWS EC2 instance. The necessary software packages that are postgres and npm

## AWS Cognito
The sign up and log in services are handled by AWS Cognito.

Follow this tutorial to create a user pool: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-as-user-directory.html

After you create the userpool, record the userPoolId, region and clientId because these are the information you are going to put in the /public/cognito/js/config.js file. 

Step 1: Create an EC2 instance on AWS and SSH into it.
Step 2: Install Postgres
a. sudo yum install postgresql-server
b. sudo mkdir /var/lib/postgres
c. sudo chmod 775 /var/lib/postgres
d. sudo chown postgres /var/lib/posgres
e. sudo -i -u postgres
f. initdb
g. exit
h. sudo systemctl start postgresql.service

Step 3: Install NodeJS
Follow this tutorial: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html

Step 4: Clone this repo using git to your local machine
git clone https://github.com/tug98850/dragonHacks2019.git

Step 5: Install the necessary node modules
npm install

Step 6: Run the application on port 4000 (make sure the security group allow port 4000 to receive inbounding traffic)
node server.js or npm start

