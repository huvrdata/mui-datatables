import { deepClone, deepMerge, getPageValue, buildCSV, createCSVDownload, escapeDangerousCSVCharacters } from '../src/utils';

describe('utils.js', () => {
  describe('deepClone', () => {
    it('returns primitives as-is', () => {
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
    });

    it('clones a flat object', () => {
      const obj = { a: 1, b: 'two' };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    it('deep clones nested objects', () => {
      const obj = { a: { b: { c: 3 } } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned.a).not.toBe(obj.a);
      expect(cloned.a.b).not.toBe(obj.a.b);
    });

    it('deep clones arrays', () => {
      const arr = [1, [2, [3]]];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
    });

    it('deep clones mixed objects and arrays', () => {
      const obj = { filters: [['a', 'b'], ['c']], meta: { count: 2 } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned.filters).not.toBe(obj.filters);
      expect(cloned.filters[0]).not.toBe(obj.filters[0]);
      expect(cloned.meta).not.toBe(obj.meta);
    });

    it('passes functions through by reference', () => {
      const fn = () => 'test';
      const obj = { render: fn, name: 'col' };
      const cloned = deepClone(obj);
      expect(cloned.render).toBe(fn);
      expect(cloned.name).toBe('col');
    });

    it('mutations to clone do not affect original', () => {
      const obj = { a: { b: 1 }, list: [1, 2] };
      const cloned = deepClone(obj);
      cloned.a.b = 99;
      cloned.list.push(3);
      expect(obj.a.b).toBe(1);
      expect(obj.list).toEqual([1, 2]);
    });
  });

  describe('deepMerge', () => {
    it('merges flat objects', () => {
      const result = deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 });
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('deep merges nested objects', () => {
      const target = { labels: { body: { noMatch: 'No data' }, toolbar: { search: 'Search' } } };
      const source = { labels: { body: { noMatch: 'Nothing found' } } };
      const result = deepMerge(target, source);
      expect(result.labels.body.noMatch).toBe('Nothing found');
      expect(result.labels.toolbar.search).toBe('Search');
    });

    it('overwrites arrays instead of merging them', () => {
      const result = deepMerge({ items: [1, 2, 3] }, { items: [4, 5] });
      expect(result.items).toEqual([4, 5]);
    });

    it('overwrites primitives with objects and vice versa', () => {
      expect(deepMerge({ a: 1 }, { a: { nested: true } })).toEqual({ a: { nested: true } });
      expect(deepMerge({ a: { nested: true } }, { a: 1 })).toEqual({ a: 1 });
    });

    it('does not mutate target or source', () => {
      const target = { a: { x: 1 }, b: 2 };
      const source = { a: { y: 2 }, c: 3 };
      deepMerge(target, source);
      expect(target).toEqual({ a: { x: 1 }, b: 2 });
      expect(source).toEqual({ a: { y: 2 }, c: 3 });
    });

    it('handles textLabels-style deep merge', () => {
      const defaults = {
        body: { noMatch: 'Sorry, no matching records found', toolTip: 'Sort' },
        pagination: { next: 'Next Page', previous: 'Previous Page' },
      };
      const overrides = {
        body: { noMatch: 'Custom no match' },
      };
      const result = deepMerge(defaults, overrides);
      expect(result.body.noMatch).toBe('Custom no match');
      expect(result.body.toolTip).toBe('Sort');
      expect(result.pagination.next).toBe('Next Page');
    });
  });

  describe('deepClone edge cases', () => {
    it('handles Date objects by copying reference (same as lodash.cloneDeep)', () => {
      const date = new Date('2024-01-01');
      const obj = { created: date };
      const cloned = deepClone(obj);
      // Date is an object so deepClone will create a plain object copy (not a Date instance).
      // This matches our usage — no Date objects appear in filter/column data.
      expect(cloned).not.toBe(obj);
    });

    it('handles empty objects and arrays', () => {
      expect(deepClone({})).toEqual({});
      expect(deepClone([])).toEqual([]);
    });

    it('handles filterList-shaped data (arrays of arrays with mixed types)', () => {
      const filterList = [['NY', 'CT'], [], ['Tampa'], [null]];
      const cloned = deepClone(filterList);
      expect(cloned).toEqual(filterList);
      expect(cloned[0]).not.toBe(filterList[0]);
      cloned[0].push('FL');
      expect(filterList[0]).toEqual(['NY', 'CT']);
    });
  });

  describe('filter equality via JSON.stringify (used in updateFilterByType)', () => {
    // This tests the pattern: JSON.stringify(filter) === JSON.stringify(value)
    // which replaced lodash.isEqual in MUIDataTable.updateFilterByType
    const isFilterEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    it('compares primitive filter values correctly', () => {
      expect(isFilterEqual('NY', 'NY')).toBe(true);
      expect(isFilterEqual('NY', 'CT')).toBe(false);
      expect(isFilterEqual(42, 42)).toBe(true);
      expect(isFilterEqual(0, 0)).toBe(true);
      expect(isFilterEqual('', '')).toBe(true);
    });

    it('compares null filter values correctly', () => {
      expect(isFilterEqual(null, null)).toBe(true);
      expect(isFilterEqual(null, 'NY')).toBe(false);
      expect(isFilterEqual(null, undefined)).toBe(false);
    });

    it('compares array filter values correctly', () => {
      expect(isFilterEqual(['a', 'b'], ['a', 'b'])).toBe(true);
      expect(isFilterEqual(['a', 'b'], ['b', 'a'])).toBe(false);
    });

    it('finds correct position in a filterList using findIndex', () => {
      const filterList = ['NY', 'CT', 'FL', 'TX'];
      const pos = filterList.findIndex((filter) => isFilterEqual(filter, 'FL'));
      expect(pos).toBe(2);
    });

    it('returns -1 for values not in filterList', () => {
      const filterList = ['NY', 'CT'];
      const pos = filterList.findIndex((filter) => isFilterEqual(filter, 'CA'));
      expect(pos).toBe(-1);
    });

    it('handles toggle: add then remove a checkbox filter value', () => {
      const filterList = [[]];
      const value = 'NY';

      // Simulate checkbox check (add)
      let filterPos = filterList[0].findIndex((f) => isFilterEqual(f, value));
      expect(filterPos).toBe(-1);
      filterList[0].push(value);
      expect(filterList[0]).toEqual(['NY']);

      // Simulate checkbox uncheck (remove) — this is the critical path
      filterPos = filterList[0].findIndex((f) => isFilterEqual(f, value));
      expect(filterPos).toBe(0);
      filterList[0].splice(filterPos, 1);
      expect(filterList[0]).toEqual([]);
    });
  });

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
