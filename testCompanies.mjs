import axios from 'axios';
import fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import csv from 'csv-parser';

const CSV_PATH = 'blue_button_numbers_V1.csv'; // Updated CSV file path
const SERVER_URL = 'http://localhost:4000/api/company';

async function testAllCompanies() {
  const companyNames = [];

  // Extract all company names from the CSV
  fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (row) => {
      companyNames.push(row.CompanyName);
    })
    .on('end', async () => {
      const failedCompanies = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const name of companyNames) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const response = await axios.get(`${SERVER_URL}?name=${encodeURIComponent(name)}`);
          if (response.data.error === 'Company not found') {
            failedCompanies.push(name);
          }
        } catch (error) {
          failedCompanies.push(name);
        }
      }

      if (failedCompanies.length) {
        // eslint-disable-next-line no-console
        console.log(`Failed to fetch data for ${failedCompanies.length} companies:`);
        // eslint-disable-next-line no-console
        console.log(failedCompanies.join('\n'));
      } else {
        // eslint-disable-next-line no-console
        console.log('All companies fetched successfully!');
      }
    });
}

testAllCompanies();
