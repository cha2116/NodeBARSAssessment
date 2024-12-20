const mockFs = require('mock-fs');
const path = require('path');
const { readCsv, readTxt } = require('../Reader/fileReader');

describe('fileReader', () => {
	afterEach(() => {
		mockFs.restore();
	});

	describe('readTxt', () => {
		it('should return a list of requests for valid TXT file', async () => {
			mockFs({
				'valid-txt.txt': '010115201302142013\n010115201602142016',
			});
			const filename = path.resolve('valid-txt.txt');
			const result = await readTxt(filename);
			expect(result).toEqual([
				{
					billing_cycle: '01',
					start_date: new Date(Date.UTC(2013, 0, 15)),
					end_date: new Date(Date.UTC(2013, 1, 14)),
					errors: null,
				},
				{
					billing_cycle: '01',
					start_date: new Date(Date.UTC(2016, 0, 15)),
					end_date: new Date(Date.UTC(2016, 1, 14)),
					errors: null,
				},
				console.log(result)
			]);
		});

		it('should throw an error for invalid billing cycle in TXT file', async () => {
			mockFs({
				'billing-cycle-not-on-range-txt.txt': '010115201302142013\n010115201602142016\n130115201302142013\n010115201602142016',
			});
			const filename = path.resolve('billing-cycle-not-on-range-txt.txt');
			await expect(readTxt(filename)).rejects.toEqual(['Billing Cycle not in range at row 3.']);
			
		});

		it('should throw an error for invalid start date format in TXT file', async () => {
			mockFs({
				'invalid-start-date-txt.txt': '010101201301312013\n010101201301312013\n0101  201301312013\n010101201301312013\n010101201301312013',
			});
			const filename = path.resolve('invalid-start-date-txt.txt');
			await expect(readTxt(filename)).rejects.toEqual(['Invalid Start Date format at row 3.']);
			
		});

		it('should throw an error for invalid end date format in TXT file', async () => {
			mockFs({
				'invalid-end-date-txt.txt': '0101012013  312013',
			});
			const filename = path.resolve('invalid-end-date-txt.txt');
			await expect(readTxt(filename)).rejects.toEqual(['Invalid End Date format at row 1.']);
			
		});

		it('should handle no records found in TXT file', async () => {
			mockFs({
				'empty-txt.txt': '',
			});
			const filename = path.resolve('empty-txt.txt');
			const result = await readTxt(filename);
			expect(result).toEqual([]);
		});
	});

	describe('readCsv', () => {
		it('should return a list of requests for valid CSV file', async () => {
			mockFs({
				'valid-csv.csv': '01,01/15/2013,02/14/2013\n01,01/15/2016,02/14/2016',
			});
			const filename = path.resolve('valid-csv.csv');
			const result = await readCsv(filename);
			expect(result).toEqual([
				{
					billing_cycle: '01',
					start_date: new Date(Date.UTC(2013, 0, 15)),
					end_date: new Date(Date.UTC(2013, 1, 14)),
					errors: null,
				},
				{
					billing_cycle: '01',
					start_date: new Date(Date.UTC(2016, 0, 15)),
					end_date: new Date(Date.UTC(2016, 1, 14)),
					errors: null,
				},
				console.log(result)
			]);
		});

		it('should throw an error for invalid billing cycle in CSV file', async () => {
			mockFs({
				'billing-cycle-not-on-range-csv.csv': '1,01/01/2013,01/31/2013\n12,01/01/2013,01/31/2013\n12,01/01/2013,01/31/2013\n13,01/01/2013,01/31/2013\n3,01/01/2013,01/31/2013',
			});
			const filename = path.resolve('billing-cycle-not-on-range-csv.csv');
			await expect(readCsv(filename)).rejects.toEqual(['Billing Cycle not in range at row 4.']);
			
		});

		it('should throw an error for invalid start date format in CSV file', async () => {
			mockFs({
				'invalid-start-date-csv.csv': '1,01/ /2013,01/31/2013',
			});
			const filename = path.resolve('invalid-start-date-csv.csv');
			await expect(readCsv(filename)).rejects.toEqual(['Invalid Start Date format at row 1.']);
			
		});

		it('should throw an error for invalid end date format in CSV file', async () => {
			mockFs({
				'invalid-end-date-csv.csv': '1,01/01/2013,05/31/2013\n1,01/01/2013,05/31/2013\n1,01/01/2013,05/31/2013\n1,01/01/2013,05/31/2013\n1,01/01/2013,05/31/2013\n1,01/01/2013,05/31/2013\n1,01/01/2013,05//2013\n1,01/01/2013,05/31/2013',
			});
			const filename = path.resolve('invalid-end-date-csv.csv');
			await expect(readCsv(filename)).rejects.toEqual(['Invalid End Date format at row 7.']);
			
		});

		it('should handle no records found in CSV file', async () => {
			mockFs({
				'empty-csv.csv': '',
			});
			const filename = path.resolve('empty-csv.csv');
			const result = await readCsv(filename);
			expect(result).toEqual([]);
		});
	});
});
