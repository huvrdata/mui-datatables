import React from 'react';
import { render, screen, fireEvent } from './test-utils';
import MUIDataTable from '../src/MUIDataTable';

describe('<TableBodyCell />', function() {
  let data;
  let columns;

  beforeAll(() => {
    columns = [
      {
        name: 'Name',
      },
      'Company',
      { name: 'City', label: 'City Label', options: { filterType: 'textField' } },
      {
        name: 'State',
        options: { filterType: 'multiselect' },
      },
      { name: 'Empty', options: { empty: true, filterType: 'checkbox' } },
    ];
    data = [
      ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
      ['John Walsh', 'Test Corp', 'Hartford', null],
      ['Bob Herm', 'Test Corp X', 'Tampa', 'FL'],
      ['James Houston', 'Test Corp', 'Dallas', 'TX'],
    ];
  });

  it('should execute "onCellClick" prop when clicked if provided', () => {
    var clickCount = 0;
    var colIndex, rowIndex, colData;
    const options = {
      onCellClick: (val, colMeta) => {
        clickCount++;
        colIndex = colMeta.colIndex;
        rowIndex = colMeta.rowIndex;
        colData = val;
      },
    };

    render(<MUIDataTable columns={columns} data={data} options={options} />);

    const cell00 = screen.getByTestId('MuiDataTableBodyCell-0-0');
    fireEvent.click(cell00);
    expect(clickCount).toBe(1);
    expect(colIndex).toBe(0);
    expect(rowIndex).toBe(0);
    expect(colData).toBe('Joe James');

    const cell23 = screen.getByTestId('MuiDataTableBodyCell-2-3');
    fireEvent.click(cell23);
    expect(clickCount).toBe(2);
    expect(colIndex).toBe(2);
    expect(rowIndex).toBe(3);
    expect(colData).toBe('Dallas');

    const cell12 = screen.getByTestId('MuiDataTableBodyCell-1-2');
    fireEvent.click(cell12);
    expect(clickCount).toBe(3);
    expect(colIndex).toBe(1);
    expect(rowIndex).toBe(2);
    expect(colData).toBe('Test Corp X');
  });
});
