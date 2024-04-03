import axios from 'axios';
import fs from 'fs';
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
            let failedCompanies = [];

            for (const name of companyNames) {
                try {
                    const response = await axios.get(`${SERVER_URL}?name=${encodeURIComponent(name)}`);
                    if (response.data.message === "Company not found") {
                        failedCompanies.push(name);
                    }
                } catch (error) {
                    console.error(`Error fetching data for ${name}:`, error.message);
                    failedCompanies.push(name);
                }
            }

            if (failedCompanies.length) {
                console.log(`Failed to fetch data for ${failedCompanies.length} companies:`);
                console.log(failedCompanies.join('\n'));
            } else {
                console.log('All companies fetched successfully!');
            }
        });
}

testAllCompanies();
