import React from 'react';
import { renderWithDnd, screen, fireEvent } from './test-utils';
import TableHead from '../src/components/TableHead';
import TableHeadCell from '../src/components/TableHeadCell';

describe('<TableHead />', function () {
  let columns;
  let handleHeadUpdateRef;

  beforeAll(() => {
    columns = [
      { name: 'First Name', label: 'First Name', display: 'true', sort: true },
      { name: 'Company', label: 'Company', display: 'true', sort: null },
      { name: 'City', label: 'City Label', display: 'true', sort: null },
      {
        name: 'State',
        label: 'State',
        display: 'true',
        options: { fixedHeaderOptions: { xAxis: true, yAxis: true }, selectableRows: 'multiple' },
        customHeadRender: (columnMeta) => <TableHeadCell {...columnMeta}>{columnMeta.name + 's'}</TableHeadCell>,
        sort: null,
      },
    ];

    handleHeadUpdateRef = () => {};
  });

  it('should render a table head', () => {
    const options = {};
    const toggleSort = () => {};
    const { container } = renderWithDnd(
      <table>
        <TableHead
          columns={columns}
          options={options}
          setCellRef={() => {}}
          handleHeadUpdateRef={handleHeadUpdateRef}
          toggleSort={toggleSort}
        />
      </table>,
    );

    const headCells = container.querySelectorAll('th, td');
    // 4 column cells + 1 select cell (hidden but present in DOM)
    expect(headCells.length).toBeGreaterThanOrEqual(4);
  });

  it('should render the label in the table head cell', () => {
    const options = {};
    const toggleSort = () => {};
    const { container } = renderWithDnd(
      <table>
        <TableHead
          columns={columns}
          options={options}
          setCellRef={() => {}}
          handleHeadUpdateRef={handleHeadUpdateRef}
          toggleSort={toggleSort}
        />
      </table>,
    );

    const row = container.querySelector('tr');
    const textContent = row.textContent;
    expect(textContent).toContain('First Name');
    expect(textContent).toContain('Company');
    expect(textContent).toContain('City Label');
    expect(textContent).toContain('States');
  });

  it('should render a table head with no visible column cells when all display=false', () => {
    const options = {};
    const toggleSort = () => {};
    const newColumns = columns.map((column) => ({ ...column, display: false }));
    const { container } = renderWithDnd(
      <table>
        <TableHead
          columns={newColumns}
          options={options}
          setCellRef={() => {}}
          handleHeadUpdateRef={handleHeadUpdateRef}
          toggleSort={toggleSort}
        />
      </table>,
    );

    // When all columns have display=false, no column head cells should render
    // (the select cell may still exist but no data columns)
    const headRow = container.querySelector('tr');
    // The text content should be empty or contain only the select cell
    const columnTexts = ['First Name', 'Company', 'City Label', 'State'];
    columnTexts.forEach((text) => {
      expect(headRow.textContent).not.toContain(text);
    });
  });

  it('should trigger toggleSort prop callback when calling method handleToggleColumn', () => {
    const options = { sort: true };
    const toggleSort = jest.fn();

    const { container } = renderWithDnd(
      <table>
        <TableHead
          columns={columns}
          options={options}
          setCellRef={() => {}}
          handleHeadUpdateRef={handleHeadUpdateRef}
          toggleSort={toggleSort}
        />
      </table>,
    );

    const sortButton = container.querySelector('th span button, td span button');
    fireEvent.click(sortButton);

    expect(toggleSort).toHaveBeenCalledTimes(1);
  });

  it('should trigger selectRowUpdate prop callback and selectChecked state update when calling method handleRowSelect', () => {
    const options = { sort: true, selectableRows: 'multiple' };
    const rowSelectUpdate = jest.fn();

    const { container } = renderWithDnd(
      <table>
        <TableHead
          columns={columns}
          options={options}
          setCellRef={() => {}}
          handleHeadUpdateRef={handleHeadUpdateRef}
          selectRowUpdate={rowSelectUpdate}
        />
      </table>,
    );

    const checkbox = container.querySelector('input[type="checkbox"]');
    fireEvent.click(checkbox);

    expect(rowSelectUpdate).toHaveBeenCalledTimes(1);
  });

  it('should render a table head with checkbox if selectableRows = multiple', () => {
    const options = { selectableRows: 'multiple' };

    const { container } = renderWithDnd(
      <table>
        <TableHead
          columns={columns}
          options={options}
          setCellRef={() => {}}
          handleHeadUpdateRef={handleHeadUpdateRef}
        />
      </table>,
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(1);
  });

  it('should render a table head with no checkbox if selectableRows = single', () => {
    const options = { selectableRows: 'single' };

    const { container } = renderWithDnd(
      <table>
        <TableHead
          columns={columns}
          options={options}
          setCellRef={() => {}}
          handleHeadUpdateRef={handleHeadUpdateRef}
        />
      </table>,
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(0);
  });

  it('should render a table head with no checkbox if selectableRows = none', () => {
    const options = { selectableRows: 'none' };

    const { container } = renderWithDnd(
      <table>
        <TableHead
          columns={columns}
          options={options}
          setCellRef={() => {}}
          handleHeadUpdateRef={handleHeadUpdateRef}
        />
      </table>,
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(0);
  });
});
