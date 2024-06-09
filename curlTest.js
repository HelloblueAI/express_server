import { exec } from 'child_process';

const companyName = 'Verizon';
const url = `https://dolphin-app-dchbn.ondigitalocean.app/api/company?name=${encodeURIComponent(companyName)}`;

exec(`curl -s -X GET "${url}"`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing curl: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  try {
    const jsonResponse = JSON.parse(stdout);
    console.log('Response:', JSON.stringify(jsonResponse, null, 2));
  } catch (parseError) {
    console.error('Error parsing response:', parseError);
    console.log('Raw response:', stdout);
  }
});
