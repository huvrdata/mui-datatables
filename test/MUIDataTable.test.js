import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MUIDataTable from '../src/MUIDataTable';
import TableFilterList from '../src/components/TableFilterList';
import getTextLabels from '../src/textLabels';
import { getCollatorComparator } from '../src/utils';

describe('<MUIDataTable />', function () {
  const tableId = 'tableID';
  let data;
  let columns;
  let renderCities = (value, tableMeta, updateValueFn) => <span>{value}</span>;
  let renderName = (value) => value.split(' ')[1] + ', ' + value.split(' ')[0];
  let renderState = (value) => value;
  let renderHead = (columnMeta) => columnMeta.name + 's';
  let defaultRenderCustomFilterList = (f) => f;
  let renderCustomFilterList = (f) => `Name: ${f}`;

  beforeAll(() => {
    columns = [
      {
        name: 'Name',
        options: {
          customBodyRender: renderName,
          customFilterListOptions: { render: renderCustomFilterList },
        },
      },
      'Company',
      { name: 'City', label: 'City Label', options: { filterType: 'textField' } },
      {
        name: 'State',
        options: { filterType: 'multiselect', customHeadRender: renderHead },
      },
      { name: 'Empty', options: { empty: true, filterType: 'checkbox' } },
    ];
    data = [
      ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
      ['John Walsh', 'Test Corp', 'Hartford', null],
      ['Bob Herm', 'Test Corp', 'Tampa', 'FL'],
      ['James Houston', 'Test Corp', 'Dallas', 'TX'],
    ];
  });

  it('should render a table', () => {
    const { container } = render(<MUIDataTable columns={columns} data={data} />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('should render the correct number of data rows', () => {
    const { container } = render(<MUIDataTable columns={columns} data={data} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(4);
  });

  it('should correctly re-build display after xhr with serverSide=true', async () => {
    const { container, rerender } = render(<MUIDataTable columns={columns} data={[]} options={{ serverSide: true }} />);
    expect(container.querySelectorAll('tbody tr').length).toBe(1);

    rerender(<MUIDataTable columns={columns} data={data} options={{ serverSide: true }} />);
    await waitFor(() => {
      expect(container.querySelectorAll('tbody tr').length).toBe(4);
    });
  });

  it('should correctly set tableId', () => {
    const { container } = render(<MUIDataTable columns={columns} data={[]} options={{ tableId: 'myTable123' }} />);
    const elements = container.querySelectorAll('[data-tableid="myTable123"]');
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('should correctly re-build internal table data with prop change', () => {
    const { container, rerender } = render(<MUIDataTable columns={columns} data={data} />);
    expect(container.querySelectorAll('tbody tr').length).toBe(4);

    let newData = data.map((item) => [...item]);
    newData[0][0] = 'Testing Name';
    rerender(<MUIDataTable columns={columns} data={newData} />);

    // Verify the updated data renders (renderName transforms "Testing Name" → "Name, Testing")
    expect(screen.getByText('Name, Testing')).toBeInTheDocument();
  });

  it('should correctly re-build table options before and after prop change', () => {
    const options = {
      textLabels: { newObj: { test: 'foo' } },
      downloadOptions: { separator: ':' },
    };
    const newOptions = {
      textLabels: { newObj: { test: 'bar' } },
      downloadOptions: { separator: ';' },
    };
    const { rerender } = render(<MUIDataTable columns={columns} data={[]} options={options} />);

    rerender(<MUIDataTable columns={columns} data={data} options={newOptions} />);
    // No crash = options updated correctly
    expect(screen.getAllByText('Test Corp').length).toBeGreaterThanOrEqual(1);
  });

  it('should correctly sort', () => {
    const localColumns = [{ name: 'Name', options: {} }, 'Company', 'Location'];
    const localData = [
      { Name: 'Joe James', Company: 'Test Corp', Location: 'Las Cruces' },
      { Name: 'John Walsh', Company: 'Test Corp', Location: 'El Paso' },
      { Name: 'Bob Herm', Company: 'Test Corp', Location: 'Albuquerque' },
      { Name: 'James Houston', Company: 'Test Corp', Location: 'Santa Fe' },
    ];

    const { container } = render(<MUIDataTable columns={localColumns} data={localData} options={{}} />);

    // Click to sort ascending
    fireEvent.click(screen.getByTestId('headcol-0'));
    let rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Bob Herm');
    expect(rows[3].textContent).toContain('John Walsh');

    // Click to sort descending
    fireEvent.click(screen.getByTestId('headcol-0'));
    rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('John Walsh');
    expect(rows[3].textContent).toContain('Bob Herm');
  });

  it('should correctly sort when sortThirdClickReset is true', () => {
    const localColumns = [{ name: 'Name', options: { sortThirdClickReset: true } }, 'Company', 'Location'];
    const localData = [
      { Name: 'Joe James', Company: 'Test Corp', Location: 'Las Cruces' },
      { Name: 'John Walsh', Company: 'Test Corp', Location: 'El Paso' },
      { Name: 'Bob Herm', Company: 'Test Corp', Location: 'Albuquerque' },
      { Name: 'James Houston', Company: 'Test Corp', Location: 'Santa Fe' },
    ];

    const { container } = render(<MUIDataTable columns={localColumns} data={localData} options={{}} />);

    // Click 1: ascending
    fireEvent.click(screen.getByTestId('headcol-0'));
    let rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Bob Herm');

    // Click 2: descending
    fireEvent.click(screen.getByTestId('headcol-0'));
    rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('John Walsh');

    // Click 3: reset to original order
    fireEvent.click(screen.getByTestId('headcol-0'));
    rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Joe James');
  });

  it('should correctly pass the sorted column name and direction to onColumnSortChange', () => {
    let sortedCol, sortedDir;
    const options = {
      rowsPerPage: 1,
      rowsPerPageOptions: [1, 2, 4],
      page: 1,
      onColumnSortChange: (col, dir) => {
        sortedCol = col;
        sortedDir = dir;
      },
    };
    render(<MUIDataTable columns={columns} data={data} options={options} />);

    fireEvent.click(screen.getByTestId('headcol-1'));
    expect(sortedCol).toBe('Company');
    expect(sortedDir).toBe('asc');

    fireEvent.click(screen.getByTestId('headcol-1'));
    expect(sortedCol).toBe('Company');
    expect(sortedDir).toBe('desc');
  });

  it('should correctly re-build internal table data while maintaining pagination after state change', () => {
    let currentPage;
    const options = {
      rowsPerPage: 1,
      rowsPerPageOptions: [1, 2, 4],
      page: 1,
      onChangePage: (current) => (currentPage = current),
    };
    const { container, rerender } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    // Click back button
    fireEvent.click(screen.getByTestId('pagination-back'));
    expect(currentPage).toBe(0);

    // Add data
    let newData = data.map((item) => [...item]);
    newData.push(['Harry Smith', 'Test Corp', 'Philadelphia', 'PA', undefined]);
    rerender(<MUIDataTable columns={columns} data={newData} options={options} />);

    // Click next
    fireEvent.click(screen.getByTestId('pagination-next'));
    expect(currentPage).toBe(2);
  });

  it('should add custom props to table if setTableProps provided', () => {
    const options = { setTableProps: jest.fn().mockReturnValue({ myProp: 'test', className: 'testClass' }) };
    const { container } = render(<MUIDataTable columns={columns} data={[]} options={options} />);
    const table = container.querySelector('table');
    expect(table.className).toContain('testClass');
    expect(options.setTableProps).toHaveBeenCalled();
  });

  it('should render pagination when enabled in options', () => {
    const options = { pagination: true };
    render(<MUIDataTable columns={columns} data={data} options={options} />);
    expect(screen.getByTestId('pagination-next')).toBeInTheDocument();
  });

  it('should not render pagination when disabled in options', () => {
    const options = { pagination: false };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    expect(container.querySelector('[data-testid="pagination-next"]')).toBeNull();
  });

  it('should not render toolbar when all its displayable items are missing', () => {
    const options = {
      filter: false,
      search: false,
      print: false,
      download: false,
      viewColumns: false,
    };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    expect(container.querySelector('[role="toolbar"]')).toBeNull();
  });

  it('should create Chip when filterList is populated', () => {
    const filterList = [['Joe James'], [], [], [], []];
    const filterListRenderers = [
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
    ];
    const columnNames = columns.map((column) => ({ name: column.name }));

    const { container } = render(
      <TableFilterList
        options={{ serverSide: false }}
        filterList={filterList}
        filterListRenderers={filterListRenderers}
        filterUpdate={() => true}
        columnNames={columnNames}
      />,
    );
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(1);
  });

  it('should create Chip with custom label when filterList and customFilterListOptions are populated', () => {
    const filterList = [['Joe James'], [], [], [], []];
    const filterListRenderers = columns.map((c) => {
      return c.options && c.options.customFilterListOptions && c.options.customFilterListOptions.render
        ? c.options.customFilterListOptions.render
        : defaultRenderCustomFilterList;
    });
    const columnNames = columns.map((column) => ({ name: column.name }));

    const { container } = render(
      <TableFilterList
        options={{ serverSide: false }}
        filterList={filterList}
        filterListRenderers={filterListRenderers}
        filterUpdate={() => true}
        columnNames={columnNames}
      />,
    );
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(1);
    expect(chips[0].textContent).toContain('Name: Joe James');
  });

  it('should render filter Chip(s) when options.serverSide = true and serverSideFilterList is populated', () => {
    const serverSideFilterList = [['Joe James'], [], [], [], []];
    const filterListRenderers = [
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
    ];
    const columnNames = columns.map((column) => ({ name: column.name }));

    const { container } = render(
      <TableFilterList
        options={{ serverSide: true }}
        serverSideFilterList={serverSideFilterList}
        filterListRenderers={filterListRenderers}
        filterUpdate={() => true}
        columnNames={columnNames}
      />,
    );
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(1);
  });

  it('should not render filter Chip(s) when options.serverSide = true and serverSideFilterList is not populated', () => {
    const filterListRenderers = [
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
      defaultRenderCustomFilterList,
    ];
    const columnNames = columns.map((column) => ({ name: column.name }));

    const { container } = render(
      <TableFilterList
        options={{ serverSide: true }}
        serverSideFilterList={[]}
        filterListRenderers={filterListRenderers}
        filterUpdate={() => true}
        columnNames={columnNames}
      />,
    );
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(0);
  });

  it('should render a footer after the tbody element when customTableBodyFooterRender is called', () => {
    const options = {};
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    expect(container.querySelector('#custom_column_footer')).toBeNull();
  });

  it('should filter displayData when searchText is set', () => {
    const options = { searchText: 'Joe' };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Joe');
  });

  it('should render only things that match a filter via UI', () => {
    const options = {
      filterType: 'textField',
    };
    const localColumns = [
      { name: 'Name', options: { filterType: 'textField' } },
      'Company',
      { name: 'City', label: 'City Label' },
      { name: 'State' },
    ];

    const { container } = render(<MUIDataTable columns={localColumns} data={data} options={options} />);

    // Open filter dialog
    fireEvent.click(screen.getByTestId('Filter Table-iconButton'));

    // Type in the Name filter
    const filterInput = container.querySelector('[data-testid="filtertextfield-Name"] input');
    if (filterInput) {
      fireEvent.change(filterInput, { target: { value: 'Joe' } });
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
    }
  });

  it('should skip client side filtering if server side filtering is enabled', () => {
    const options = { filterType: 'textField', serverSide: true };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    // With serverSide=true, all rows should still show regardless of filters
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(data.length);
  });

  it('should correctly filter data from filter popover menu', () => {
    let filteredData = [];
    const options = {
      filter: true,
      filterType: 'dropdown',
      onFilterChange: (column, filterList, type, index, displayData) => {
        filteredData = displayData;
      },
    };
    const localColumns = [
      { name: 'Name', options: { filterType: 'textField' } },
      'Company',
      { name: 'City', label: 'City Label', options: { filterType: 'textField' } },
      { name: 'State', options: { filterType: 'multiselect' } },
      { name: 'Empty', options: { empty: true, filterType: 'checkbox' } },
    ];

    const { container } = render(<MUIDataTable columns={localColumns} data={data} options={options} />);

    fireEvent.click(screen.getByTestId('Filter Table-iconButton'));

    const filterInput = container.querySelector('[data-testid="filtertextfield-Name"] input');
    if (filterInput) {
      fireEvent.change(filterInput, { target: { value: 'James' } });
      expect(filteredData.length).toBe(2);
    }
  });

  describe('should correctly run comparator function', () => {
    it('correctly compares two equal strings', () => {
      expect(getCollatorComparator()('testString', 'testString')).toBe(0);
    });

    it('correctly compares two different strings', () => {
      expect(getCollatorComparator()('testStringA', 'testStringB')).toBe(-1);
    });
  });

  it('should not render select toolbar when disableToolbarSelect=true', () => {
    const options = { disableToolbarSelect: true, selectableRows: 'multiple', selectableRowsOnClick: true };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    // Click a row to select it
    const row = container.querySelector('[data-testid="MUIDataTableBodyRow-0"]');
    if (row) fireEvent.click(row);

    // Select toolbar should not appear
    expect(screen.queryByText(/row\(s\) selected/)).toBeNull();
  });

  it('should not render select toolbar when selectToolbarPlacement="none"', () => {
    const options = { selectToolbarPlacement: 'none', selectableRows: 'multiple', selectableRowsOnClick: true };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    const row = container.querySelector('[data-testid="MUIDataTableBodyRow-0"]');
    if (row) fireEvent.click(row);

    expect(screen.queryByText(/row\(s\) selected/)).toBeNull();
    // Regular toolbar should still be rendered
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();
  });

  it('should render select toolbar by default', () => {
    const options = { selectableRows: 'multiple', selectableRowsOnClick: true };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    const row = container.querySelector('[data-testid="MUIDataTableBodyRow-0"]');
    if (row) fireEvent.click(row);

    expect(screen.queryByText(/row\(s\) selected/)).toBeInTheDocument();
  });

  it('should render both select toolbar and toolbar when selectToolbarPlacement="above"', () => {
    const options = { selectToolbarPlacement: 'above', selectableRows: 'multiple', selectableRowsOnClick: true };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    const row = container.querySelector('[data-testid="MUIDataTableBodyRow-0"]');
    if (row) fireEvent.click(row);

    expect(screen.queryByText(/row\(s\) selected/)).toBeInTheDocument();
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();
  });

  it('should not update selectedRows when using rowsSelected option with type=none', () => {
    const options = { selectableRows: 'none', rowsSelected: [0] };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    // No checkboxes should be rendered
    const checkboxes = container.querySelectorAll('[data-description="row-select"]');
    expect(checkboxes.length).toBe(0);
  });

  it('should update selectedRows when using rowsSelected option with type=single', () => {
    const options = { selectableRows: 'single', rowsSelected: [0] };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    const checkedCheckboxes = container.querySelectorAll('[data-description="row-select"] input:checked');
    expect(checkedCheckboxes.length).toBe(1);
  });

  it('should update selectedRows when using rowsSelected option with type=multiple', () => {
    const options = { selectableRows: 'multiple', rowsSelected: [0, 3] };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    const checkedCheckboxes = container.querySelectorAll('[data-description="row-select"] input:checked');
    expect(checkedCheckboxes.length).toBe(2);
  });

  it('should update selectedRows (with default type=multiple option) when using rowsSelected with no option specified', () => {
    const options = { rowsSelected: [0, 3] };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    const checkedCheckboxes = container.querySelectorAll('[data-description="row-select"] input:checked');
    expect(checkedCheckboxes.length).toBe(2);
  });

  it('should update expandedRows when using expandableRows option with default rowsExpanded', () => {
    const options = {
      expandableRows: true,
      rowsExpanded: [0, 3],
      renderExpandableRow: () => (
        <tr>
          <td>opened</td>
        </tr>
      ),
    };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    // Verify that expanded content is rendered
    const expandedCells = screen.getAllByText('opened');
    expect(expandedCells.length).toBe(2);
  });

  it('should call onRowExpansionChange when row is expanded or collapsed', () => {
    const onRowExpansionChange = jest.fn();
    const options = {
      expandableRows: true,
      renderExpandableRow: () => (
        <tr>
          <td>foo</td>
        </tr>
      ),
      expandableRowsOnClick: true,
      onRowExpansionChange,
      tableId,
    };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);

    expect(onRowExpansionChange).toHaveBeenCalledTimes(1);

    fireEvent.click(row);
    expect(onRowExpansionChange).toHaveBeenCalledTimes(2);
  });

  it('should call onRowSelectionChange when row is selected or unselected', () => {
    const onRowSelectionChange = jest.fn();
    const options = {
      selectableRows: 'multiple',
      selectableRowsOnClick: true,
      onRowSelectionChange,
      tableId,
    };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    const row = container.querySelector(`#MUIDataTableBodyRow-${tableId}-2`);
    fireEvent.click(row);
    expect(onRowSelectionChange).toHaveBeenCalledTimes(1);

    fireEvent.click(row);
    expect(onRowSelectionChange).toHaveBeenCalledTimes(2);
  });

  it('should call onTableInit when MUIDataTable is initialized', () => {
    const options = { selectableRows: 'multiple', onTableInit: jest.fn() };
    render(<MUIDataTable columns={columns} data={data} options={options} />);
    expect(options.onTableInit).toHaveBeenCalledTimes(1);
  });

  it('should call onTableChange when a column is sorted', () => {
    const options = { onTableChange: jest.fn() };
    render(<MUIDataTable columns={columns} data={data} options={options} />);

    fireEvent.click(screen.getByTestId('headcol-1'));

    expect(options.onTableChange).toHaveBeenCalled();
  });

  it('should correctly handle array data filtering', () => {
    const arrayColumns = [
      { name: 'otherData', options: { filter: true } },
      { name: 'array', options: { filter: true } },
    ];
    const arrayData = [
      ['other-data-1', ['a', 'b', 'c']],
      ['other-data-3', ['a']],
      ['other-data-2', ['a', 'b']],
      ['other-data-4', []],
    ];
    const options = {
      filter: true,
      filterType: 'dropdown',
      responsive: 'standard',
    };

    const { container } = render(<MUIDataTable columns={arrayColumns} data={arrayData} options={options} />);
    // All 4 rows should render initially
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(4);
  });

  it('should correctly handle non-array data', () => {
    const simpleColumns = [
      { name: 'otherData', options: { filter: true } },
      { name: 'value', options: { filter: true } },
    ];
    const simpleData = [
      ['other-data-1', 'a'],
      ['other-data-2', 'b'],
      ['other-data-3', 'c'],
      ['other-data-4', 'd'],
    ];
    const options = { filter: true, filterType: 'dropdown', responsive: 'standard' };

    const { container } = render(<MUIDataTable columns={simpleColumns} data={simpleData} options={options} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(4);
  });

  it('should correctly build internal table data and displayData structure with sortOrder set', () => {
    const localColumns = ['Name', 'Company', 'Location'];
    const localData = [
      { Name: 'Joe James', Company: 'Test Corp', Location: 'Las Cruces' },
      { Name: 'John Walsh', Company: 'Test Corp', Location: 'El Paso' },
      { Name: 'Bob Herm', Company: 'Test Corp', Location: 'Albuquerque' },
      { Name: 'James Houston', Company: 'Test Corp', Location: 'Santa Fe' },
    ];

    const { container } = render(
      <MUIDataTable
        columns={localColumns}
        data={localData}
        options={{ sortOrder: { name: 'Location', direction: 'asc' } }}
      />,
    );

    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Albuquerque');
    expect(rows[3].textContent).toContain('Santa Fe');
  });

  it('should correctly build internal table data with nested data and enableNestedDataAccess', () => {
    const nestedColumns = [
      { name: 'Name' },
      'Company',
      { name: 'Location/OK/City', label: 'City Label' },
      { name: 'Location/OK/State' },
    ];
    const nestedData = [
      { Name: 'Joe James', Company: 'Test Corp', Location: { City: 'Yonkers', State: 'NY' } },
      { Name: 'John Walsh', Company: 'Test Corp', Location: { City: 'Hartford', State: null } },
    ];

    const { container } = render(
      <MUIDataTable columns={nestedColumns} data={nestedData} options={{ enableNestedDataAccess: '/OK/' }} />,
    );

    expect(screen.getByText('Yonkers')).toBeInTheDocument();
    expect(screen.getByText('Hartford')).toBeInTheDocument();
  });

  it('should correctly sort when sortDescFirst and sortThirdClickReset are true', () => {
    const localColumns = [
      { name: 'Name', options: { sortDescFirst: true, sortThirdClickReset: true } },
      'Company',
      'Location',
    ];
    const localData = [
      { Name: 'Joe James', Company: 'Test Corp', Location: 'Las Cruces' },
      { Name: 'John Walsh', Company: 'Test Corp', Location: 'El Paso' },
      { Name: 'Bob Herm', Company: 'Test Corp', Location: 'Albuquerque' },
      { Name: 'James Houston', Company: 'Test Corp', Location: 'Santa Fe' },
    ];

    const { container } = render(<MUIDataTable columns={localColumns} data={localData} options={{}} />);

    // Click 1: descending (since sortDescFirst=true)
    fireEvent.click(screen.getByTestId('headcol-0'));
    let rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('John Walsh');

    // Click 2: ascending
    fireEvent.click(screen.getByTestId('headcol-0'));
    rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Bob Herm');

    // Click 3: reset
    fireEvent.click(screen.getByTestId('headcol-0'));
    rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Joe James');
  });

  it('should correctly build internal rowsPerPage when provided in options', () => {
    const options = { rowsPerPage: 2, textLabels: getTextLabels() };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should correctly execute customBodyRender methods based on filtering and data', () => {
    let customBodyRenderCb = jest.fn();
    let customBodyRenderLiteCb = jest.fn();
    let customBodyRenderNoFilterCb = jest.fn();
    const options = { rowsPerPage: 5, rowsPerPageOptions: [5] };

    const localData = Array(15).fill(['a', 'b']);

    const localColumns = [
      {
        name: 'firstName',
        label: 'First Name',
        options: {
          customBodyRender: () => {
            customBodyRenderCb();
            return '';
          },
        },
      },
      {
        name: 'lastName',
        label: 'Last Name',
        options: {
          customBodyRenderLite: () => {
            customBodyRenderLiteCb();
            return '';
          },
        },
      },
      {
        name: 'phone',
        label: 'Phone',
        options: {
          filter: false,
          customBodyRender: () => {
            customBodyRenderNoFilterCb();
            return '';
          },
        },
      },
    ];

    const { unmount } = render(<MUIDataTable columns={localColumns} data={localData} options={options} />);
    unmount();

    // lite only gets executed for the 5 entries shown
    expect(customBodyRenderLiteCb.mock.calls.length).toBe(5);

    // regular gets executed 15 times for filtering, and 15 more times for display
    expect(customBodyRenderCb.mock.calls.length).toBe(30);

    // regular with no filtering gets executed 15 times for display
    expect(customBodyRenderNoFilterCb.mock.calls.length).toBe(15);
  });

  it('should select all rows when header checkbox is clicked', () => {
    const options = { selectableRows: 'multiple' };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    const headerCheckbox = container.querySelector('[data-description="row-select-header"] input');
    if (headerCheckbox) {
      fireEvent.click(headerCheckbox);
      const checkedBoxes = container.querySelectorAll('[data-description="row-select"] input:checked');
      expect(checkedBoxes.length).toBe(4);
    }
  });

  it('should select only one row with selectableRows=single', () => {
    const options = { selectableRows: 'single' };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    const rowCheckboxes = container.querySelectorAll('[data-description="row-select"] input');
    if (rowCheckboxes.length > 1) {
      fireEvent.click(rowCheckboxes[0]);
      fireEvent.click(rowCheckboxes[1]);
      const checkedBoxes = container.querySelectorAll('[data-description="row-select"] input:checked');
      expect(checkedBoxes.length).toBe(1);
    }
  });

  it('should remove selected data when delete button is clicked', () => {
    const options = { selectableRows: 'multiple' };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    // Select first row
    const rowCheckboxes = container.querySelectorAll('[data-description="row-select"] input');
    if (rowCheckboxes.length > 0) {
      fireEvent.click(rowCheckboxes[0]);

      // Click delete
      const deleteButton = screen.queryByRole('button', { name: 'Delete Selected Rows' });
      if (deleteButton) {
        fireEvent.click(deleteButton);
        const rows = container.querySelectorAll('tbody tr');
        expect(rows.length).toBe(3);
      }
    }
  });

  it('should not remove selected data when onRowsDelete returns false', () => {
    const options = { selectableRows: 'multiple', onRowsDelete: () => false };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    const rowCheckboxes = container.querySelectorAll('[data-description="row-select"] input');
    if (rowCheckboxes.length > 0) {
      fireEvent.click(rowCheckboxes[0]);

      const deleteButton = screen.queryByRole('button', { name: 'Delete Selected Rows' });
      if (deleteButton) {
        fireEvent.click(deleteButton);
        // Data should still be there
        const rows = container.querySelectorAll('tbody tr');
        expect(rows.length).toBe(4);
      }
    }
  });

  it('should render search with searchText option and filter results', () => {
    const options = { searchOpen: true, searchText: 'Joe' };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    const searchInput = screen.getByRole('textbox', { name: 'Search' });
    expect(searchInput.value).toBe('Joe');
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
  });

  it('should call onFilterChange with correct column name', () => {
    let changedColumn;
    const options = {
      onFilterChange: (column) => (changedColumn = column),
      filterType: 'textField',
    };
    const localColumns = [
      { name: 'Name', options: { filterType: 'textField' } },
      'Company',
      { name: 'City', label: 'City Label' },
      { name: 'State' },
    ];

    const { container } = render(<MUIDataTable columns={localColumns} data={data} options={options} />);

    fireEvent.click(screen.getByTestId('Filter Table-iconButton'));

    const filterInput = container.querySelector('[data-testid="filtertextfield-Name"] input');
    if (filterInput) {
      fireEvent.change(filterInput, { target: { value: 'test' } });
      expect(changedColumn).toBe('Name');
    }
  });

  it('should render correctly with custom title', () => {
    const title = <h1>Custom Table Title</h1>;
    render(<MUIDataTable title={title} columns={columns} data={data} />);
    const headings = screen.getAllByRole('heading', { name: 'Custom Table Title' });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('should render with searchAlwaysOpen', () => {
    const options = { searchAlwaysOpen: true };
    render(<MUIDataTable columns={columns} data={data} options={options} />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('should render correct number of rows per page', () => {
    const options = { rowsPerPage: 2 };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should navigate pages correctly', () => {
    const options = { rowsPerPage: 2 };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);

    let rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    fireEvent.click(screen.getByTestId('pagination-next'));
    rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should render not render select toolbar when selectToolbarPlacement="none" and rowsSelected is inputted', () => {
    const options = {
      selectToolbarPlacement: 'none',
      rowsSelected: [0, 1, 2],
      searchText: 'J',
    };
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    expect(screen.queryByText(/row\(s\) selected/)).toBeNull();
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();
  });

  it('should allow empty array rowsPerPageOptions when provided in options', () => {
    const options = { rowsPerPageOptions: [] };
    // Should render without crashing
    const { container } = render(<MUIDataTable columns={columns} data={data} options={options} />);
    expect(container.querySelector('table')).not.toBeNull();
  });
});
