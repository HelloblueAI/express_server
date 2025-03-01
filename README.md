<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1500" zoomAndPan="magnify" viewBox="0 0 1125 374.999991" height="500" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="ca6404bdc1"><path d="M 95.070312 150 L 149.070312 150 L 149.070312 225 L 95.070312 225 Z M 95.070312 150 " clip-rule="nonzero"/></clipPath><clipPath id="184ee83fb1"><path d="M 54 242 L 243 242 L 243 302.535156 L 54 302.535156 Z M 54 242 " clip-rule="nonzero"/></clipPath><clipPath id="ec488a2dcc"><path d="M 150 132 L 273.066406 132 L 273.066406 265 L 150 265 Z M 150 132 " clip-rule="nonzero"/></clipPath><clipPath id="0fb7e77f21"><path d="M 25.566406 132 L 148 132 L 148 265 L 25.566406 265 Z M 25.566406 132 " clip-rule="nonzero"/></clipPath><clipPath id="9854196e2f"><path d="M 86 72.285156 L 212 72.285156 L 212 271 L 86 271 Z M 86 72.285156 " clip-rule="nonzero"/></clipPath></defs><g clip-path="url(#ca6404bdc1)"><path fill="#43c2f3" d="M 149.042969 197.964844 C 149.042969 212.90625 136.960938 225.019531 122.050781 225.019531 C 107.140625 225.019531 95.054688 212.90625 95.054688 197.964844 C 95.054688 183.019531 122.050781 150.015625 122.050781 150.015625 C 122.050781 150.015625 149.042969 183.019531 149.042969 197.964844 " fill-opacity="1" fill-rule="nonzero"/></g><g clip-path="url(#184ee83fb1)"><path fill="#40b93c" d="M 242.367188 272.761719 C 242.367188 286.941406 211.605469 298.824219 170.230469 301.984375 C 163.1875 302.519531 155.832031 280.746094 148.269531 280.746094 C 140.949219 280.746094 133.820312 302.539062 126.980469 302.03125 C 85.265625 298.949219 54.171875 287.015625 54.171875 272.761719 C 54.171875 256.167969 96.300781 242.714844 148.269531 242.714844 C 200.238281 242.714844 242.367188 256.167969 242.367188 272.761719 " fill-opacity="1" fill-rule="nonzero"/></g><g clip-path="url(#ec488a2dcc)"><path fill="#ee1997" d="M 238.578125 247.253906 C 220.261719 267.976562 188.582031 269.949219 167.824219 251.664062 C 147.066406 233.375 145.089844 201.75 163.40625 181.027344 C 181.722656 160.300781 273.035156 132.648438 273.035156 132.648438 C 273.035156 132.648438 256.902344 226.53125 238.578125 247.253906 " fill-opacity="1" fill-rule="nonzero"/></g><g clip-path="url(#0fb7e77f21)"><path fill="#ee1997" d="M 60.046875 247.25 C 78.363281 267.972656 110.042969 269.945312 130.800781 251.65625 C 151.5625 233.367188 153.539062 201.746094 135.21875 181.023438 C 116.902344 160.296875 25.601562 132.652344 25.601562 132.652344 C 25.601562 132.652344 41.730469 226.53125 60.046875 247.25 " fill-opacity="1" fill-rule="nonzero"/></g><path fill="#ad1268" d="M 235.128906 225.285156 C 226.421875 255.855469 194.53125 273.59375 163.902344 264.898438 C 133.28125 256.203125 115.515625 224.371094 124.222656 193.796875 C 132.929688 163.222656 213.925781 89.3125 213.925781 89.3125 C 213.925781 89.3125 243.839844 194.710938 235.128906 225.285156 " fill-opacity="1" fill-rule="nonzero"/><path fill="#ad1268" d="M 66.242188 225.285156 C 74.953125 255.855469 106.839844 273.59375 137.464844 264.898438 C 168.09375 256.203125 185.859375 224.371094 177.148438 193.796875 C 168.441406 163.222656 87.449219 89.3125 87.449219 89.3125 C 87.449219 89.3125 57.535156 194.710938 66.242188 225.285156 " fill-opacity="1" fill-rule="nonzero"/><g clip-path="url(#9854196e2f)"><path fill="#ee1997" d="M 211.949219 208.082031 C 211.949219 242.613281 183.90625 270.605469 149.316406 270.605469 C 114.726562 270.605469 86.683594 242.613281 86.683594 208.082031 C 86.683594 173.546875 149.316406 72.285156 149.316406 72.285156 C 149.316406 72.285156 211.949219 173.546875 211.949219 208.082031 " fill-opacity="1" fill-rule="nonzero"/></g></svg>
![Copy of Copy of Copy of Copy of Untitled (120 x 100 px)](https://github.com/HelloblueAI/express_server/assets/81389644/82726605-097d-43be-80a4-ff3c0d08886f)

### hbLab-B01 API Server
This project is an Express.js API server that handles requests for company information stored in a PostgreSQL database. It utilizes `cors` for cross-origin resource sharing and is equipped with `winston` for logging.




### Performance Enhancements

*   Multi-core processing using Node.js cluster module to utilize all CPU cores
*   Two-level caching with both memory (very fast) and disk caching
*   Adaptive concurrency that automatically adjusts based on server response times
*   Optimized database connection pooling
*   Data compression for reduced network and storage usage


### Reliability Improvements

*   Smart retry logic with exponential backoff for transient errors
*   Better error handling and reporting
*   Progress tracking with time estimates
*   File exports for failed requests to help with debugging


### Code Structure

*   More efficient resource usage
*   Fixed bugs and edge cases
*   ESLint compliance


### Prerequisites

![71a60a94-b852-4636-94cf-e0b4de6d3371](https://github.com/pejmantheory/express_server/assets/81389644/b2a0795e-d1fc-4d15-aeae-946564977d9e)

- Node.js (preferably the latest LTS version)
- PostgreSQL database
- A `.env` file with your environment variables (e.g., `DATABASE_URL`)

### Installation

Clone the repository and install dependencies:

`git clone <https://github.com/HelloblueAI/express_server.git>`

`cd <express_server>`

`pnpm install`

Optionally, you can specify the `PORT` environment variable in the `.env` file to override the default port (8080).

### Running the Server

To launch the server, execute:
```bash
pnpm start
```
This command starts the server on the specified port or defaults to 8080 and logs startup details in the console.

### API Endpoints

- `GET /`
  - Returns a simple "Hello World!" message.
- `GET /api/company`
  - Fetches company information based on the provided query parameter name, e.g., `/api/company?name=exampleCompany`. Returns company details if found; otherwise, it responds with a 404 error and a "Company not found." message.

### Logging

Logs are managed through `winston` and are directed to:
- `combined.log` - Contains all logs.
- `error.log` - Contains only logs of error level.

### Security and CORS

The server configures CORS to accept requests from the following origins:
- `http://localhost:3001`

Requests originating from other sources will be rejected to ensure security.

### Security Policy
For detailed information on our security practices and how to report security vulnerabilities, please see our [Security Policy](https://github.com/HelloblueAI/express_server/blob/76c83a36dbf7df1e01149c0a19b252ee9079ab2b/SECURITY.md)

### Reporting a Vulnerability

If you discover a potential security issue in our project, please send us a confidential report to `security@helloblue.ai`. Do not report security vulnerabilities through public GitHub issues.

### Response Protocol

Upon receiving a security vulnerability report, the protocol is as follows:

- **Acknowledgment**: You will receive an initial response within 48 hours, acknowledging receipt of your report.
- **Investigation**: We will investigate the issue and determine the necessary remediation steps.
- **Resolution**: We aim to resolve significant issues within 90 days of report verification, depending on the severity and complexity. We will keep you informed of our progress.

### Public Disclosure

- **Acknowledgment**: Vulnerabilities found and resolved will be publicly acknowledged in our project updates. Reporters may be credited for their discovery, provided they consent to be recognized.


### Contributing

Contributions are highly encouraged. Please fork the repository, make your changes, and submit a pull request. If you encounter any issues, please submit a new issue on our [issues page](https://github.com/HelloblueAI/hbLab-B01/issues)

### License

For more information see the [LICENSE](LICENSE.md)

![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql)
![Express](https://img.shields.io/badge/Framework-Express-000000?logo=express)
![PM2](https://img.shields.io/badge/Process_Manager-PM2-2B037A?logo=pm2)
![Axios](https://img.shields.io/badge/HTTP-Axios-5A29E4?logo=axios)
![JWT Auth](https://img.shields.io/badge/Auth-JWT%20Bearer-FF6600?logo=jsonwebtokens)
![ES6+](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)
![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?logo=node.js)
![pnpm](https://img.shields.io/badge/Package%20Manager-pnpm-F69220?logo=pnpm)
![GitHub CI/CD](https://img.shields.io/github/actions/workflow/status/HelloblueAI/express_server/ci-cd.yml?logo=github-actions&label=CI/CD)
![AWS](https://img.shields.io/badge/Cloud-AWS-FF9900?logo=amazon-aws)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)
![CORS](https://img.shields.io/badge/CORS-Enabled-blue)
![Winston](https://img.shields.io/badge/Logging-Winston-231F20?logo=winston)
![HTTPS](https://img.shields.io/badge/HTTPS-Supported-green?logo=letsencrypt)
![Security](https://img.shields.io/badge/Security-Enabled-brightgreen?logo=shield-check)
![REST API](https://img.shields.io/badge/API-REST-blue?logo=api)
![Swagger](https://img.shields.io/badge/Docs-Swagger-85EA2D?logo=swagger)
![Postman](https://img.shields.io/badge/Tested%20on-Postman-orange?logo=postman)
![ESLint](https://img.shields.io/badge/Linter-ESLint-4B32C3?logo=eslint)
