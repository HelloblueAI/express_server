# HelloBlue API Server

This project is an Express.js API server that handles requests for company information stored in a PostgreSQL database. It utilizes `cors` for cross-origin resource sharing and is equipped with `winston` for logging.

## Prerequisites

- Node.js (preferably the latest LTS version)
- PostgreSQL database
- A `.env` file with a environment variables (e.g., `DATABASE_URL`)

## Installation

Clone the repository and install dependencies:

`git clone <repository-url>`
`cd <repository-directory>`
`npm install`


Here's a README.md file that describes your server setup, including details about its dependencies, configuration, and usage:

markdown
Copy code
# HelloBlue API Server

This project is an Express.js API server that handles requests for company information stored in a PostgreSQL database. It utilizes `cors` for cross-origin resource sharing and is equipped with `winston` for logging.

## Prerequisites

- Node.js (preferably the latest LTS version)
- PostgreSQL database
- A `.env` file with your environment variables (e.g., `DATABASE_URL`)

## Installation

Clone the repository and install dependencies:

`git clone <repository-url>`
`cd <repository-directory>`
`npm install`

# Configuration
Create a .env file in the root of your project with the following required environment variable:

# plaintext
DATABASE_URL=your_database_connection_string
Optionally, you can specify the PORT environment variable in the .env file to override the default port (8080).

Running the Server
To start the server, run:

`npm start`
This will start the server on the specified port or default to 8080, logging the startup details to the console.

API Endpoints
GET /
Returns a simple "Hello World!" message.

GET /api/company
Fetches company information based on the provided query parameter name. It expects a URL like:


/api/company?name=exampleCompany
If found, it returns the company details, otherwise, it will return a 404 error with the message "Company not found."

Logging
Logs are written to the console and to files in the project root:

combined.log - Contains all logs.
error.log - Contains only error level logs.
Security and CORS
The server is configured to accept requests from the following origins:

https://helloblue.ai
http://localhost:3000
https://dolphin-app-dchbn.ondigitalocean.app
Requests from other origins will be rejected.

Contributing
Contributions are welcome. Please fork the repository and submit a pull request with your changes.

License
Specify your license here or state that the project is unlicensed.
