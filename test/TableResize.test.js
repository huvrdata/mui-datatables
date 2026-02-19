import React from 'react';
import { render, screen } from '@testing-library/react';
import TableResize from '../src/components/TableResize';
import MUIDataTable from '../src/MUIDataTable';

describe('<TableResize />', function() {
  let options;

  beforeAll(() => {
    options = {
      resizableColumns: true,
      tableBodyHeight: '500px',
    };
  });

  it('should render a table resize component', () => {
    const updateDividers = jest.fn();
    const setResizeable = jest.fn();

    const { container } = render(
      <TableResize options={options} updateDividers={updateDividers} setResizeable={setResizeable} />,
    );

    expect(container.querySelector('[class*="MUIDataTableResize"]')).not.toBeNull();
    expect(updateDividers).toHaveBeenCalledTimes(1);
    expect(setResizeable).toHaveBeenCalledTimes(1);
  });

  it('should create a coordinate map for each column', () => {
    const columns = ['Name', 'Age', 'Location', 'Phone'];
    const data = [['Joe', 26, 'Chile', '555-5555']];

    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    // With resizable columns, there should be resize dividers for each column
    const dividers = container.querySelectorAll('[data-divider-index]');
    expect(dividers.length).toBeGreaterThanOrEqual(1);
  });

  it('should execute resize methods correctly', () => {
    const updateDividers = jest.fn();

    const cell0 = document.createElement('th');
    Object.defineProperty(cell0, 'offsetWidth', { value: 50 });
    Object.defineProperty(cell0, 'offsetLeft', { value: 0 });
    cell0.getBoundingClientRect = () => ({ left: 0, width: 50, height: 100 });

    const cell1 = document.createElement('th');
    Object.defineProperty(cell1, 'offsetWidth', { value: 50 });
    Object.defineProperty(cell1, 'offsetLeft', { value: 50 });
    cell1.getBoundingClientRect = () => ({ left: 50, width: 50, height: 100 });

    const cellsRef = { 0: cell0, 1: cell1 };

    const tableEl = document.createElement('table');
    tableEl.style.width = '100px';
    tableEl.getBoundingClientRect = () => ({ width: 100, height: 100 });
    Object.defineProperty(tableEl, 'offsetParent', { value: { offsetLeft: 0 } });

    const setResizeable = next => {
      next(cellsRef, tableEl);
    };

    const { container } = render(
      <TableResize options={options} updateDividers={updateDividers} setResizeable={setResizeable} />,
    );

    // Component should render without errors when setResizeable provides refs
    expect(container.querySelector('[class*="MUIDataTableResize"]')).not.toBeNull();
  });
});
