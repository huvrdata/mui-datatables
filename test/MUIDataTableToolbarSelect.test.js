import React from 'react';
import { render, screen } from '@testing-library/react';
import TableToolbarSelect from '../src/components/TableToolbarSelect';
import getTextLabels from '../src/textLabels';

describe('<TableToolbarSelect />', function () {
  it('should render table toolbar select', () => {
    const onRowsDelete = () => {};
    const { container } = render(
      <TableToolbarSelect
        options={{ textLabels: getTextLabels() }}
        selectedRows={{ data: [1] }}
        onRowsDelete={onRowsDelete}
      />,
    );
    expect(screen.getByRole('button', { name: 'Delete Selected Rows' })).toBeInTheDocument();
  });

  it('should call customToolbarSelect with 3 arguments', () => {
    const onRowsDelete = () => {};
    const customToolbarSelect = jest.fn();
    const selectedRows = { data: [1] };
    const displayData = [1];
    render(
      <TableToolbarSelect
        options={{ textLabels: getTextLabels(), customToolbarSelect }}
        selectedRows={selectedRows}
        onRowsDelete={onRowsDelete}
        displayData={displayData}
      />,
    );
    expect(customToolbarSelect).toHaveBeenCalledWith(selectedRows, displayData, expect.any(Function));
  });

  it('should throw TypeError if selectedRows is not an array of numbers', (done) => {
    const onRowsDelete = () => {};
    const selectRowUpdate = () => {};
    const customToolbarSelect = (_, __, setSelectedRows) => {
      expect(() => setSelectedRows('')).toThrow(TypeError);
      expect(() => setSelectedRows(['1'])).toThrow(TypeError);
      done();
    };
    const selectedRows = { data: [1] };
    const displayData = [1];
    render(
      <TableToolbarSelect
        options={{ textLabels: getTextLabels(), customToolbarSelect }}
        selectedRows={selectedRows}
        onRowsDelete={onRowsDelete}
        displayData={displayData}
        selectRowUpdate={selectRowUpdate}
      />,
    );
  });

  it('should call selectRowUpdate when customToolbarSelect passed and setSelectedRows was called', () => {
    const onRowsDelete = () => {};
    const selectRowUpdate = jest.fn();
    const customToolbarSelect = (_, __, setSelectedRows) => {
      setSelectedRows([1]);
    };
    const selectedRows = { data: [1] };
    const displayData = [1];
    render(
      <TableToolbarSelect
        options={{ textLabels: getTextLabels(), customToolbarSelect }}
        selectedRows={selectedRows}
        onRowsDelete={onRowsDelete}
        displayData={displayData}
        selectRowUpdate={selectRowUpdate}
      />,
    );
    expect(selectRowUpdate).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when multiple rows are selected and selectableRows="single"', () => {
    const onRowsDelete = () => {};
    const selectRowUpdate = jest.fn();
    const selectedRows = { data: [1] };
    const displayData = [1];
    let caughtError = false;
    const customToolbarSelect = (_, __, setSelectedRows) => {
      try {
        setSelectedRows([1, 2]);
      } catch (err) {
        caughtError = true;
      }
    };
    render(
      <TableToolbarSelect
        options={{ textLabels: getTextLabels(), selectableRows: 'single', customToolbarSelect }}
        selectedRows={selectedRows}
        onRowsDelete={onRowsDelete}
        displayData={displayData}
        selectRowUpdate={selectRowUpdate}
      />,
    );
    expect(caughtError).toBe(true);
  });
});
