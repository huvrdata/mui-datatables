import { getPageValue, buildCSV, createCSVDownload, escapeDangerousCSVCharacters } from '../src/utils';

describe('utils.js', () => {
  describe('escapeDangerousCSVCharacters', () => {
    it('properly escapes the first character in a string if it can be used for injection', () => {
      expect(escapeDangerousCSVCharacters('+SUM(1+1)')).toBe("'+SUM(1+1)");
      expect(escapeDangerousCSVCharacters('-SUM(1+1)')).toBe("'-SUM(1+1)");
      expect(escapeDangerousCSVCharacters('=SUM(1+1)')).toBe("'=SUM(1+1)");
      expect(escapeDangerousCSVCharacters('@SUM(1+1)')).toBe("'@SUM(1+1)");
      expect(escapeDangerousCSVCharacters(123)).toBe(123);
    });
  });

  describe('getPageValue', () => {
    it('returns the highest in bounds page value when page is out of bounds and count is greater than rowsPerPage', () => {
      const count = 30;
      const rowsPerPage = 10;
      const page = 5;

      const actualResult = getPageValue(count, rowsPerPage, page);
      expect(actualResult).toBe(2);
    });

    it('returns the highest in bounds page value when page is in bounds and count is greater than rowsPerPage', () => {
      const count = 30;
      const rowsPerPage = 10;
      const page = 1;

      const actualResult = getPageValue(count, rowsPerPage, page);
      expect(actualResult).toBe(1);
    });

    it('returns the highest in bounds page value when page is out of bounds and count is less than rowsPerPage', () => {
      const count = 3;
      const rowsPerPage = 10;
      const page = 1;

      const actualResult = getPageValue(count, rowsPerPage, page);
      expect(actualResult).toBe(0);
    });

    it('returns the highest in bounds page value when page is in bounds and count is less than rowsPerPage', () => {
      const count = 3;
      const rowsPerPage = 10;
      const page = 0;

      const actualResult = getPageValue(count, rowsPerPage, page);
      expect(actualResult).toBe(0);
    });

    it('returns the highest in bounds page value when page is out of bounds and count is equal to rowsPerPage', () => {
      const count = 10;
      const rowsPerPage = 10;
      const page = 1;

      const actualResult = getPageValue(count, rowsPerPage, page);
      expect(actualResult).toBe(0);
    });

    it('returns the highest in bounds page value when page is in bounds and count is equal to rowsPerPage', () => {
      const count = 10;
      const rowsPerPage = 10;
      const page = 0;

      const actualResult = getPageValue(count, rowsPerPage, page);
      expect(actualResult).toBe(0);
    });
  });

  describe('buildCSV', () => {
    const options = {
      downloadOptions: {
        separator: ';',
      },
      onDownload: null,
    };
    const columns = [
      {
        name: 'firstname',
        download: true,
      },
      {
        name: 'lastname',
        download: true,
      },
    ];

    it('properly builds a csv when given a non-empty dataset', () => {
      const data = [{ data: ['anton', 'abraham'] }, { data: ['berta', 'buchel'] }];
      const csv = buildCSV(columns, data, options);

      expect(csv).toBe('"firstname";"lastname"\r\n' + '"anton";"abraham"\r\n' + '"berta";"buchel"');
    });

    it('returns an empty csv with header when given an empty dataset', () => {
      const data = [];
      const csv = buildCSV(columns, data, options);

      expect(csv).toBe('"firstname";"lastname"');
    });
  });

  describe('createCSVDownload', () => {
    const columns = [
      {
        name: 'firstname',
        download: true,
      },
      {
        name: 'lastname',
        download: true,
      },
    ];
    const data = [{ data: ['anton', 'abraham'] }, { data: ['berta', 'buchel'] }];

    it('does not call download function if download callback returns `false`', () => {
      const options = {
        downloadOptions: {
          separator: ';',
        },
        onDownload: () => false,
      };
      const downloadCSV = jest.fn();

      createCSVDownload(columns, data, options, downloadCSV);

      expect(downloadCSV).toHaveBeenCalledTimes(0);
    });

    it('calls download function if download callback returns truthy', () => {
      const options = {
        downloadOptions: {
          separator: ';',
        },
        onDownload: () => true,
      };
      const downloadCSV = jest.fn();

      createCSVDownload(columns, data, options, downloadCSV);

      expect(downloadCSV).toHaveBeenCalledTimes(1);
    });
  });
});
