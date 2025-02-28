//  Copyright (c) 2025, Helloblue Inc.
//  Open-Source Community Edition

//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to use,
//  copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
//  the Software, subject to the following conditions:

//  1. The above copyright notice and this permission notice shall be included in
//     all copies or substantial portions of the Software.
//  2. Contributions to this project are welcome and must adhere to the project's
//     contribution guidelines.
//  3. The name "Helloblue Inc." and its contributors may not be used to endorse
//     or promote products derived from this software without prior written consent.

//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.

import { exec } from 'child_process';
import { performance } from 'perf_hooks';
import os from 'os';

const config = {
  apiBaseUrl: 'https://dolphin-app-dchbn.ondigitalocean.app/api/company',
  timeout: 10,
  concurrentRequests: Math.max(1, os.cpus().length - 1),
  companies: [
    'Verizon',
    'Apple',
    'Microsoft',
    'Google',
    'Amazon',
  ],
};

// Queue for managing requests
const queue = [...config.companies];
const results = [];
let runningRequests = 0;
const startTime = performance.now();

/**
 * Execute a curl request for a specific company
 * @param {string} company - Company name to fetch
 * @returns {Promise<void>}
 */
function fetchCompanyData(company) {
  return new Promise((resolve) => {
    const companyStartTime = performance.now();
    const url = `${config.apiBaseUrl}?name=${encodeURIComponent(company)}`;
    const curlCommand = `curl -s -X GET "${url}" -m ${config.timeout}`;

    console.log(`Fetching data for ${company}...`);

    exec(curlCommand, (error, stdout, stderr) => {
      runningRequests--;

      if (error) {
        console.error(`Error fetching ${company}: ${error.message}`);
        results.push({
          company,
          error: error.message,
          duration: performance.now() - companyStartTime,
        });
      } else if (stderr) {
        console.error(`stderr for ${company}: ${stderr}`);
        results.push({
          company,
          error: stderr,
          duration: performance.now() - companyStartTime,
        });
      } else {
        try {
          const jsonResponse = JSON.parse(stdout);
          const duration = performance.now() - companyStartTime;

          results.push({
            company,
            data: jsonResponse,
            duration,
          });

          console.log(`✓ ${company} (${duration.toFixed(2)}ms)`);
        } catch (parseError) {
          console.error(`Error parsing response for ${company}:`, parseError);
          results.push({
            company,
            error: 'JSON parse error',
            raw: stdout,
            duration: performance.now() - companyStartTime,
          });
        }
      }


      processNextInQueue();
      resolve();
    });
  });
}

/**
 * Process the next company in the queue if possible
 */
function processNextInQueue() {

  if (queue.length === 0 && runningRequests === 0) {
    printSummary();
    return;
  }

  while (queue.length > 0 && runningRequests < config.concurrentRequests) {
    const company = queue.shift();
    runningRequests++;
    fetchCompanyData(company);
  }
}

/**
 * Print a summary of all the fetched results
 */
function printSummary() {
  const totalDuration = performance.now() - startTime;

  console.log('\n========= RESULTS SUMMARY =========');
  console.log(`Total time: ${totalDuration.toFixed(2)}ms`);
  console.log(`Companies processed: ${results.length}`);
  console.log(`Concurrent requests: ${config.concurrentRequests}`);

  const successful = results.filter(r => !r.error).length;
  console.log(`Success rate: ${successful}/${results.length} (${(successful/results.length*100).toFixed(2)}%)`);

  const sortedResults = [...results].sort((a, b) => a.duration - b.duration);

  console.log('\nPerformance by company:');
  sortedResults.forEach(result => {
    const status = result.error ? '❌' : '✓';
    console.log(`${status} ${result.company}: ${result.duration.toFixed(2)}ms`);
  });

  console.log('\nDetailed results:');
  results.forEach(result => {
    console.log(`\n${result.company}:`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    } else {
      console.log(`  Data: ${JSON.stringify(result.data, null, 2)}`);
    }
  });
}

console.log(`Starting company data fetch with ${config.concurrentRequests} concurrent requests...\n`);
processNextInQueue();
