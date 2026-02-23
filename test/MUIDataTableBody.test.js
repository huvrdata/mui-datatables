import React from 'react';
import { render, screen, fireEvent } from './test-utils';
import getTextLabels from '../src/textLabels';
import TableBody from '../src/components/TableBody';

describe('<TableBody />', function () {
  let data;
  let displayData;
  let columns;
  const tableId = 'tableID';

  beforeAll(() => {
    columns = [{ name: 'First Name' }, { name: 'Company' }, { name: 'City' }, { name: 'State' }];
    data = [
      ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
      ['John Walsh', 'Test Corp', null, 'CT'],
      ['Bob Herm', 'Test Corp', 'Tampa', 'FL'],
      ['James Houston', 'Test Corp', 'Dallas', 'TX'],
    ];
    displayData = [
      { data: ['Joe James', 'Test Corp', 'Yonkers', 'NY'], dataIndex: 0 },
      { data: ['John Walsh', 'Test Corp', null, 'CT'], dataIndex: 1 },
      { data: ['Bob Herm', 'Test Corp', 'Tampa', 'FL'], dataIndex: 2 },
      { data: ['James Houston', 'Test Corp', 'Dallas', 'TX'], dataIndex: 3 },
    ];
  });

  // Helper to wrap TableBody in valid HTML table structure
  const renderTableBody = (props) => {
    return render(
      <table>
        <TableBody {...props} />
      </table>,
    );
  };

  it('should render a table body with no selectable cells if selectableRows = none', () => {
    const options = { selectableRows: 'none' };
    const selectRowUpdate = () => {};
    const toggleExpandRow = () => {};

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: [],
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
    });

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(0);
  });

  it('should render a table body with no records if no data provided', () => {
    const options = { selectableRows: false, textLabels: getTextLabels() };
    const selectRowUpdate = () => {};
    const toggleExpandRow = () => {};

    renderTableBody({
      data: [],
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: [],
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
    });

    expect(screen.getByText('Sorry, no matching records found')).toBeInTheDocument();
  });

  it('should render a table body with selectable cells if selectableRows = true', () => {
    const options = { selectableRows: true };
    const selectRowUpdate = () => {};
    const toggleExpandRow = () => {};

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: [],
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
    });

    const selectCells = container.querySelectorAll('[data-description="row-select"]');
    expect(selectCells).toHaveLength(4);
  });

  it('should return the correct rowIndex when calling instance method getRowIndex', () => {
    // getRowIndex(2) with page=1, rowsPerPage=2 => startIndex = 1*2 = 2, result = 2+2 = 4
    // We test this indirectly: render with page=1, rowsPerPage=2, and verify the
    // onChange handler on a select cell receives the correct row index.
    // The third row on page 1 (index 2 within the page's data) should yield getRowIndex(2)=4.
    // However, with page=1 and rowsPerPage=2, only indices 2..3 of displayData are shown.
    // Row at position 0 on page 1 is displayData[2], getRowIndex(0) = 2+0 = 2
    // Row at position 1 on page 1 is displayData[3], getRowIndex(1) = 2+1 = 3
    // So we check a checkbox on the first row of page 1 and expect dataIndex=2, index=2
    const selectRowUpdate = jest.fn();
    const options = { sort: true, selectableRows: true };

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 1,
      rowsPerPage: 2,
      selectedRows: { data: [], lookup: {} },
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow: () => {},
      options,
      searchText: '',
      filterList: [],
    });

    // Click the first checkbox input on the rendered page (page 1 shows rows at displayData index 2 and 3)
    const checkboxInputs = container.querySelectorAll('[data-description="row-select"] input');
    expect(checkboxInputs.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(checkboxInputs[0]);

    // selectRowUpdate should be called with 'cell', { index: 2, dataIndex: 2 }, []
    expect(selectRowUpdate).toHaveBeenCalledTimes(1);
    expect(selectRowUpdate).toHaveBeenCalledWith('cell', { index: 2, dataIndex: 2 }, []);
  });

  it('should return correctly if row exists in selectedRows when calling instance method isRowSelected', () => {
    // isRowSelected checks selectedRows.lookup[dataIndex]
    // With selectedRows lookup {1:true, 2:true, 3:true}, dataIndex 5 should NOT be selected.
    // We verify by rendering and checking that row at dataIndex=0 is not marked as selected
    // since it's not in the lookup.
    const options = { sort: true, selectableRows: true };

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 15,
      selectedRows: {
        data: [
          { index: 1, dataIndex: 1 },
          { index: 2, dataIndex: 2 },
          { index: 3, dataIndex: 3 },
        ],
        lookup: { 1: true, 2: true, 3: true },
      },
      selectRowUpdate: () => {},
      expandedRows: [],
      toggleExpandRow: () => {},
      options,
      searchText: '',
      filterList: [],
    });

    // Row at dataIndex 0 should NOT be selected (aria-checked or Mui-selected)
    const row0 = screen.getByTestId('MUIDataTableBodyRow-0');
    expect(row0).not.toHaveClass('mui-row-selected');
  });

  it('should trigger selectRowUpdate prop callback when calling method handleRowSelect', () => {
    const options = { sort: true, selectableRows: true, selectableRowsOnClick: true };
    const selectRowUpdate = jest.fn();

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: { data: [], lookup: {} },
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow: () => {},
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    // Click on row to trigger handleRowSelect via selectableRowsOnClick
    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);

    expect(selectRowUpdate).toHaveBeenCalledTimes(1);
  });

  it('should select the adjacent rows when a row is shift+clicked and a previous row has been selected.', () => {
    let adjacentRows = [];
    const options = { sort: true, selectableRows: true, selectableRowsOnClick: true };
    const previousSelectedRow = { index: 0, dataIndex: 0 };
    const selectRowUpdate = (type, data, adjacent) => {
      adjacentRows = adjacent;
    };
    const selectedRows = { data: [], lookup: {} };

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows,
      selectRowUpdate,
      previousSelectedRow,
      expandedRows: [],
      toggleExpandRow: () => {},
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-3`);
    fireEvent.click(row, { shiftKey: true });

    expect(adjacentRows).toHaveLength(3);
  });

  it('should gather selected row data when clicking row with selectableRowsOnClick=true.', () => {
    let selectedRowData;
    const options = { selectableRows: true, selectableRowsOnClick: true };
    const selectRowUpdate = (type, data) => (selectedRowData = data);
    const toggleExpandRow = jest.fn();

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: { data: [], lookup: {} },
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);

    const expectedResult = { index: 2, dataIndex: 2 };
    expect(selectedRowData).toEqual(expectedResult);
    expect(toggleExpandRow).toHaveBeenCalledTimes(0);
  });

  it('should not gather selected row data when clicking row with selectableRowsOnClick=true when it is disabled with isRowSelectable via index.', () => {
    let selectedRowData;
    const options = {
      selectableRows: true,
      selectableRowsOnClick: true,
      isRowSelectable: (dataIndex) => (dataIndex === 2 ? false : true),
    };
    const selectRowUpdate = (_, data) => (selectedRowData = data);
    const toggleExpandRow = jest.fn();

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: { data: [], lookup: {} },
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);

    expect(selectedRowData).toBeUndefined();
    expect(toggleExpandRow).toHaveBeenCalledTimes(0);
  });

  it('should not gather expanded row data when clicking row with expandableRowsOnClick=true when it is disabled with isRowExpandable via dataIndex.', () => {
    let expandedRowData;
    const toggleExpandRow = jest.fn((data) => (expandedRowData = data));
    const options = {
      expandableRows: true,
      renderExpandableRow: () => (
        <tr>
          <td>foo</td>
        </tr>
      ),
      expandableRowsOnClick: true,
      isRowExpandable: (dataIndex) => (dataIndex === 2 ? false : true),
    };

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: [],
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);

    expect(expandedRowData).toBeUndefined();
    expect(toggleExpandRow).toHaveBeenCalledTimes(0);
  });

  it('should not gather selected row data when clicking row with selectableRowsOnClick=true when it is disabled with isRowSelectable via selectedRows.', () => {
    let selectedRowData;
    const options = {
      selectableRows: true,
      selectableRowsOnClick: true,
      isRowSelectable: (dataIndex, selectedRows) => selectedRows.lookup[dataIndex] || selectedRows.data.length < 1,
    };
    const selectRowUpdate = (_, data) => (selectedRowData = data);
    const toggleExpandRow = jest.fn();
    const initialSelectedRows = {
      data: [{ index: 1, dataIndex: 1 }],
      lookup: { 1: true },
    };

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: initialSelectedRows,
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);

    expect(selectedRowData).toBeUndefined();
    expect(toggleExpandRow).toHaveBeenCalledTimes(0);
  });

  it('should gather selected row data when clicking row with selectableRowsOnClick=true when it is enabled with isRowSelectable via dataIndex.', () => {
    let selectedRowData;
    const options = {
      selectableRows: true,
      selectableRowsOnClick: true,
      isRowSelectable: (dataIndex, selectedRows) => selectedRows.lookup[dataIndex] || selectedRows.data.length < 1,
    };
    const selectRowUpdate = (_, data) => (selectedRowData = data);
    const toggleExpandRow = jest.fn();
    const initialSelectedRows = {
      data: [{ index: 1, dataIndex: 1 }],
      lookup: { 1: true },
    };

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: initialSelectedRows,
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    // Click on row 1 (dataIndex 1) which IS in the lookup, so isRowSelectable returns true
    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-1`);
    fireEvent.click(row);

    expect(selectedRowData).toBeDefined();
    expect(toggleExpandRow).toHaveBeenCalledTimes(0);
  });

  it('should gather expanded row data when clicking row with expandableRowsOnClick=true when it is enabled with isRowExpandable via dataIndex.', () => {
    let expandedRowData;
    const options = {
      expandableRows: true,
      renderExpandableRow: () => (
        <tr>
          <td>foo</td>
        </tr>
      ),
      expandableRowsOnClick: true,
      isRowExpandable: (dataIndex) => (dataIndex === 2 ? true : false),
    };
    const toggleExpandRow = jest.fn((data) => (expandedRowData = data));

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: [],
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);

    expect(expandedRowData).toBeDefined();
    expect(toggleExpandRow).toHaveBeenCalledTimes(1);
  });

  it('should gather expanded row data when clicking row with expandableRows=true and expandableRowsOnClick=true.', () => {
    let expandedRowData;
    const options = { selectableRows: true, expandableRows: true, expandableRowsOnClick: true };
    const selectRowUpdate = jest.fn();
    const toggleExpandRow = (data) => (expandedRowData = data);

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: { data: [], lookup: {} },
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);

    const expectedResult = { index: 2, dataIndex: 2 };
    expect(expandedRowData).toEqual(expectedResult);
    expect(selectRowUpdate).toHaveBeenCalledTimes(0);
  });

  it('should gather both selected and expanded row data when clicking row with expandableRows=true, selectableRowsOnClick=true, and expandableRowsOnClick=true.', () => {
    let expandedRowData;
    let selectedRowData;
    const options = {
      selectableRows: true,
      selectableRowsOnClick: true,
      expandableRows: true,
      expandableRowsOnClick: true,
    };
    const selectRowUpdate = (type, data) => (selectedRowData = data);
    const toggleExpandRow = (data) => (expandedRowData = data);

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: { data: [], lookup: {} },
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);

    const expectedResult = { index: 2, dataIndex: 2 };
    expect(selectedRowData).toEqual(expectedResult);
    expect(expandedRowData).toEqual(expectedResult);
  });

  it('should not call onRowClick when clicking on checkbox for selectable row', () => {
    const onRowClick = jest.fn();
    const options = { selectableRows: true, onRowClick };
    const selectRowUpdate = jest.fn();
    const toggleExpandRow = jest.fn();

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: { data: [], lookup: {} },
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    // Click on the first checkbox input (inside a select cell)
    const checkbox = container.querySelector('[data-description="row-select"] input');
    fireEvent.click(checkbox);

    // Clicking the checkbox input triggers onChange on the Checkbox (selecting the row),
    // but the click doesn't bubble to the row's onClick handler in this environment.
    expect(onRowClick).toHaveBeenCalledTimes(0);
  });

  it('should not call onRowClick when clicking to select a row', () => {
    const onRowClick = jest.fn();
    const options = { selectableRows: true, selectableRowsOnClick: true, onRowClick };
    const selectRowUpdate = jest.fn();
    const toggleExpandRow = jest.fn();

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: { data: [], lookup: {} },
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow,
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    // Click on the row itself (selectableRowsOnClick means clicking row selects it, and onRowClick should not fire)
    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-0`);
    fireEvent.click(row);

    expect(onRowClick).toHaveBeenCalledTimes(0);
  });

  it('should call onRowClick when Row is clicked', () => {
    const onRowClick = jest.fn();
    const options = { selectableRows: true, onRowClick };
    const selectRowUpdate = jest.fn();

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: { data: [], lookup: {} },
      selectRowUpdate,
      expandedRows: [],
      toggleExpandRow: () => {},
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(
      data[2],
      expect.objectContaining({ rowIndex: 2, dataIndex: 2 }),
      expect.anything(),
    );
  });

  it("should add custom props to rows if 'setRowProps' provided", () => {
    const setRowProps = jest.fn().mockReturnValue({ className: 'testClass' });
    const options = { setRowProps };

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: [],
      selectRowUpdate: jest.fn(),
      expandedRows: [],
      toggleExpandRow: () => {},
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-1`);
    expect(row.className).toContain('testClass');
    expect(setRowProps).toHaveBeenCalled();
    expect(setRowProps).toHaveBeenCalledWith(data[1], 1, expect.anything());
  });

  it("should not fail if 'setRowProps' returns undefined", () => {
    const setRowProps = jest.fn().mockReturnValue(undefined);
    const options = { setRowProps };

    const { container } = renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: [],
      selectRowUpdate: jest.fn(),
      expandedRows: [],
      toggleExpandRow: () => {},
      options,
      searchText: '',
      filterList: [],
      tableId,
    });

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-1`);
    expect(row.className).not.toContain('testClass');
    expect(setRowProps).toHaveBeenCalled();
    expect(setRowProps).toHaveBeenCalledWith(data[1], 1, expect.anything());
  });

  it("should use 'customRowRender' when provided", () => {
    const options = { customRowRender: () => <div>Test_Text</div> };

    renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      rowsPerPage: 10,
      selectedRows: [],
      selectRowUpdate: jest.fn(),
      expandedRows: [],
      toggleExpandRow: () => {},
      options,
      searchText: '',
      filterList: [],
    });

    expect(screen.getAllByText('Test_Text').length).toBeGreaterThanOrEqual(1);
  });

  it('should pass in selectedRows to isRowSelectable', () => {
    const selectedIndex = 2;
    const originalSelectedRows = {
      data: [{ index: selectedIndex, dataIndex: selectedIndex }],
      lookup: { [selectedIndex]: true },
    };
    const isRowSelectable = jest.fn((_, selectedRows) => {
      expect(selectedRows).toEqual(originalSelectedRows);
      return true;
    });

    const options = { selectableRows: true, isRowSelectable };

    renderTableBody({
      data: displayData,
      count: displayData.length,
      columns,
      page: 0,
      selectedRows: originalSelectedRows,
      rowsPerPage: 10,
      expandedRows: [],
      options,
      searchText: '',
      filterList: [],
    });

    expect(isRowSelectable).toHaveBeenCalledTimes(displayData.length);
  });
});
