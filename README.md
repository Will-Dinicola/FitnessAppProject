# This project was created using **React** for the frontend, **Flask** for the backend, and **MySQL (via Railway)** for the database, to create a fitness tracker and incentivizer to help users achieve their goals

# Setup

## Running the DB

### Create a **_.env_** file in the fitness-backend folder (same location as app.py) & insert the code:

_to create the .env file, just create a new file and call it .env_

**CODE:**

DB_HOST=your-db-host

DB_PORT=your-db-port

DB_USER=your-db-user

DB_PASSWORD=your-db-password

DB_NAME=FitnessAppDB


_Please contact Nhi for the information on the DB since these are just placeholders due to security risks._


### Install dependencies:

pip install -r requirements.txt

### Connect to SQL Server:

1. Navigate to fitness-backend folder
2. enter the mysql command: mysql -h caboose.proxy.rlwy.net -P 53416 -u root -p --ssl-mode=REQUIRED railway
3. enter password
4. YOU'RE IN!


### Start the Flask Sever

Navigate to fitness-backend and run *python app.py*

### Start the React Server

Navigate to fitness-frontend and run *npm run start*

### The React, Flask, and Database should be open in three separate command line interfaces.

