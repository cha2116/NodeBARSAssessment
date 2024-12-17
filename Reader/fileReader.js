const fs = require('fs'); // Added for file system operations
const csv = require('csv-parser');
const readline = require('readline');

// Function to parse a date string into a Date object based on the given format
function parseDate(dateStr, format) {
	if (format === 'MMDDYYYY') {
		const month = parseInt(dateStr.substring(0, 2)) - 1;
		const day = parseInt(dateStr.substring(2, 4));
		const year = parseInt(dateStr.substring(4, 8));
		return new Date(Date.UTC(year, month, day));
	} else if (format === 'MM/DD/YYYY') {
		const [month, day, year] = dateStr.split('/').map(Number);
		return new Date(Date.UTC(year, month - 1, day));
	}
	return null;
}

// Function to validate if a date string matches the given format
function isValidDate(dateStr, format) {
	if (format === 'MMDDYYYY') {
		return /^\d{2}\d{2}\d{4}$/.test(dateStr);
	} else if (format === 'MM/DD/YYYY') {
		return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr);
	}
	return false;
}

// Function to validate and parse a record, returning an object with the parsed data or errors
function validateAndParseRecord(billingCycle, startDateStr, endDateStr, rowNumber, dateFormat) {
	const errors = [];
	if (parseInt(billingCycle) < 1 || parseInt(billingCycle) > 12) {
		const message = `Billing Cycle not in range at row ${rowNumber}.`;
		console.error(message); // Added logging for validation errors
		errors.push(message);
	}
	if (!isValidDate(startDateStr, dateFormat)) {
		const message = `Invalid Start Date format at row ${rowNumber}.`;
		console.error(message); // Added logging for validation errors
		errors.push(message);
	}
	if (!isValidDate(endDateStr, dateFormat)) {
		const message = `Invalid End Date format at row ${rowNumber}.`;
		console.error(message); // Added logging for validation errors
		errors.push(message);
	}
	if (errors.length === 0) {
		const startDate = parseDate(startDateStr, dateFormat);
		const endDate = parseDate(endDateStr, dateFormat);
		if (startDate > endDate) {
			const message = `Start Date is after End Date at row ${rowNumber}.`;
			console.error(message); // Added logging for validation errors
			errors.push(message);
		}
	}
	return {
		billing_cycle: billingCycle,
		start_date: parseDate(startDateStr, dateFormat),
		end_date: parseDate(endDateStr, dateFormat),
		errors: errors.length > 0 ? errors : null,
	};
}

// Function to process a line from a TXT file and validate/parse it
function processLine(line, rowNumber, dateFormat) {
	const billingCycle = line.substring(0, 2).trim(); // Keep as string
	const startDateStr = line.substring(2, 10);
	const endDateStr = line.substring(10, 18);
	return validateAndParseRecord(billingCycle, startDateStr, endDateStr, rowNumber, dateFormat);
}

// Function to process a row of CSV data and validate/parse it
function processCsvData(data, rowNumber) {
	const billingCycle = data.billing_cycle.trim(); // Keep as string
	return validateAndParseRecord(billingCycle, data.start_date, data.end_date, rowNumber, 'MM/DD/YYYY');
}

// Helper function to handle the common logic for processing results and errors
function handleResultsAndErrors(resolve, reject, requests, errors) {
	if (errors.length > 0) {
		reject(errors);
	} else {
		resolve(requests);
	}
}

// Function to read and parse a CSV file
async function readCsv(filename) {
	const requests = [];
	const errors = [];
	let rowNumber = 0;
	return new Promise((resolve, reject) => {
		fs.createReadStream(filename)
			.pipe(csv({ headers: ['billing_cycle', 'start_date', 'end_date'], skipLines: 0 }))
			.on('data', (data) => {
				rowNumber++;
				const result = processCsvData(data, rowNumber);
				if (result.errors) {
					errors.push(...result.errors);
				} else {
					requests.push(result);
				}
			})
			.on('end', () => handleResultsAndErrors(resolve, reject, requests, errors))
			.on('error', (error) => {
				console.error('Error reading CSV file:', error); // Added logging for file reading errors
				reject(error);
			});
	});
}

// Function to read and parse a TXT file
async function readTxt(filename) {
	const requests = [];
	const errors = [];
	const rl = readline.createInterface({
		input: fs.createReadStream(filename),
		crlfDelay: Infinity,
	});

	return new Promise((resolve, reject) => {
		let rowNumber = 0;
		rl.on('line', (line) => {
			rowNumber++;
			const result = processLine(line, rowNumber, 'MMDDYYYY');
			if (result.errors) {
				errors.push(...result.errors);
			} else {
				requests.push(result);
			}
		});
		rl.on('close', () => handleResultsAndErrors(resolve, reject, requests, errors));
		rl.on('error', (error) => {
			console.error('Error reading TXT file:', error); // Added logging for file reading errors
			reject(error);
		});
	});
}

module.exports = { readCsv, readTxt };
