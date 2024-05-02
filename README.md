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

## Configuration

Create a `.env` file in the root of your project directory and include the following essential environment variable:
```plaintext
DATABASE_URL=your_database_connection_string
```
Optionally, you can specify the `PORT` environment variable in the `.env` file to override the default port (8080).

## Running the Server

To launch the server, execute:
```bash
npm start
```
This command starts the server on the specified port or defaults to 8080 and logs startup details in the console.

## API Endpoints

- `GET /`
  - Returns a simple "Hello World!" message.
- `GET /api/company`
  - Fetches company information based on the provided query parameter name, e.g., `/api/company?name=exampleCompany`. Returns company details if found; otherwise, it responds with a 404 error and a "Company not found." message.

## Logging

Logs are managed through `winston` and are directed to:
- `combined.log` - Contains all logs.
- `error.log` - Contains only logs of error level.

## Security and CORS

The server configures CORS to accept requests from the following origins:
- `https://helloblue.ai`
- `http://localhost:3000`
- `https://dolphin-app-dchbn.ondigitalocean.app`

Requests originating from other sources will be rejected to ensure security.

## Contributing

Contributions are highly encouraged. Please fork the repository, make your changes, and submit a pull request.

## License

For more information on the licensing of this project, see the [LICENSE](LICENSE.md) file.
