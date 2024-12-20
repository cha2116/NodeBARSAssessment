const path = require('path');
const Billing = require('../Models/barsData');
const Query = require('../Models/queryData');
const { readCsv, readTxt } = require('../Reader/fileReader');

// Function to handle file upload and processing
exports.uploadFile = async (req, res) => {
	const file = req.file;
	if (!file) {
		const message = 'No file uploaded.';
		console.error(message);
		return res.status(400).json({ message });
	}

	const ext = path.extname(file.originalname).toLowerCase();
	if (ext !== '.txt' && ext !== '.csv') {
		const message = 'File is not supported for processing.';
		console.error(message);
		return res.status(400).json({ message });
	}

	try {
		let results;
		if (ext === '.csv') {
			results = await readCsv(file.path); // Read CSV file
		} else if (ext === '.txt') {
			results = await readTxt(file.path); // Read TXT file
		}

		if (results.length === 0) {

			const message = 'No valid request(s) to read from the input file.';
			console.error(message);
			return res.status(400).json({ message });
		}
	

		await processAndSaveRecords(results, res, ext); // Process and save records
	} catch (errors) {
		res.status(400).json({ message: errors.join(', ') });
	}
};

// Function to prepare query for database search
function prepareQuery(results) {
	return results.map((record) => ({
		billing_cycle: record.billing_cycle, 
		start_date: record.start_date,
		end_date: record.end_date,
	}));
}

// Function to process and save records to the database
async function processAndSaveRecords(results, res, fileType) {
	try {
		// Check if records exist in the database
		const query = {
			$or: prepareQuery(results, fileType),
		};

		const matchingRecords = await getMatchingRecords(query);

		if (matchingRecords.length === 0) {
			const message = 'No record found!';
			console.error(message);
			return res.status(404).json({ message });
		}

		// Log the query data if matching records are found
		query.$or.forEach((q) => console.log(q));

		const formattedRecords = matchingRecords.map((record) => {
			return formatRecord(record, fileType);
		});

		// Save each query data to queries collection
		const queryData = query.$or.map((q) => ({
			billing_cycle: q.billing_cycle,
			start_date: q.start_date,
			end_date: q.end_date,
		}));
		await Query.insertMany(queryData);

		res.status(200).json(formattedRecords);
	} catch (error) {
		console.error('Error processing records:', error);
		if (!res.headersSent) {
			res.status(500).json({ message: 'Error processing records' });
		}
	}
}
// Asynchronous function to get matching billing records based on a query
async function getMatchingRecords(query) {
	// Query the Billing collection for records that match the query
	// and select specific fields to return
	return Billing.find(query).select('_id billing_cycle start_date end_date amount account.account_name account.customer.first_name account.customer.last_name');
}
// Function to format a date based on the file type
function formatOriginalDate(date, fileType) {
	// Create a new Date object from the input date
	const d = new Date(date);
	if (fileType === '.csv') {
		// Return the date in MM/DD/YYYY format
		return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
		// Check if the file type is '.txt'
	} else if (fileType === '.txt') {
		const month = (d.getMonth() + 1).toString().padStart(2, '0');
		const day = d.getDate().toString().padStart(2, '0');
		const year = d.getFullYear();
		// Return the date in MMDDYYYY format
		return `${month}${day}${year}`;
	}
	// If the file type is neither '.csv' nor '.txt', return the original date
	return date;
}

//This function formats a record object based on the file type. It returns a new object with specific properties formatted accordingly.
function formatRecord(record, fileType) {
	return {
		_id: record._id, // Copy the _id as is
		billing_cycle: fileType === '.txt' ? record.billing_cycle.toString().padStart(2, '0') : record.billing_cycle, // Format billing_cycle for .txt files
		start_date: formatOriginalDate(record.start_date, fileType), // Format start_date based on fileType
		end_date: formatOriginalDate(record.end_date, fileType), // Format end_date based on fileType
		account_name: record.account.account_name, // Copy the account_name from nested account object
		first_name: record.account.customer.first_name, // Copy the first_name from nested customer object
		last_name: record.account.customer.last_name, // Copy the last_name from nested customer object
		amount: record.amount, // Copy the amount as is
	};
}
