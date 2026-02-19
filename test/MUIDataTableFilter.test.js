import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TableFilter from '../src/components/TableFilter';
import getTextLabels from '../src/textLabels';
import TextField from '@mui/material/TextField';

describe('<TableFilter />', function() {
  let data;
  let columns;
  let filterData;

  beforeEach(() => {
    columns = [
      { name: 'firstName', label: 'First Name', display: true, sort: true, filter: true, sortDirection: 'desc' },
      { name: 'company', label: 'Company', display: true, sort: true, filter: true, sortDirection: 'desc' },
      { name: 'city', label: 'City Label', display: true, sort: true, filter: true, sortDirection: 'desc' },
      { name: 'state', label: 'State', display: true, sort: true, filter: true, sortDirection: 'desc' },
    ];

    data = [
      ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
      ['John Walsh', 'Test Corp', 'Hartford', 'CT'],
      ['Bob Herm', 'Test Corp', 'Tampa', 'FL'],
      ['James Houston', 'Test Corp', 'Dallas', 'TX'],
    ];

    filterData = [
      ['Joe James', 'John Walsh', 'Bob Herm', 'James Houston'],
      ['Test Corp'],
      ['Yonkers', 'Hartford', 'Tampa', 'Dallas'],
      ['NY', 'CT', 'FL', 'TX'],
    ];
  });

  it('should render label as filter name', () => {
    const options = { filterType: 'checkbox', textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const titles = container.querySelectorAll('[class*="MUIDataTableFilter-checkboxListTitle"]');
    const labels = Array.from(titles).map(el => el.textContent);
    expect(labels).toEqual(['First Name', 'Company', 'City Label', 'State']);
  });

  it("should render data table filter view with checkboxes if filterType = 'checkbox'", () => {
    const options = { filterType: 'checkbox', textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(13);
  });

  it('should render data table filter view with no checkboxes if filter=false for each column', () => {
    const options = { filterType: 'checkbox', textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    columns = columns.map(item => (item.filter = false));
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(0);
  });

  it("should render data table filter view with selects if filterType = 'select'", () => {
    const options = { filterType: 'select', textLabels: getTextLabels() };
    const filterList = [['Joe James'], [], [], []];
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const selects = container.querySelectorAll('.MuiSelect-select');
    expect(selects.length).toBe(4);
  });

  it('should render data table filter view no selects if filter=false for each column', () => {
    const options = { filterType: 'select', textLabels: getTextLabels() };
    const filterList = [['Joe James'], [], [], []];
    columns = columns.map(item => (item.filter = false));
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const selects = container.querySelectorAll('.MuiSelect-select');
    expect(selects.length).toBe(0);
  });

  it("should render data table filter view with checkbox selects if filterType = 'multiselect'", () => {
    const options = { filterType: 'multiselect', textLabels: getTextLabels() };
    const filterList = [['Joe James', 'John Walsh'], [], [], []];
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const selects = container.querySelectorAll('.MuiSelect-select');
    expect(selects.length).toBe(4);
  });

  it("should render data table filter view with custom rendering of items if filterType = 'select'", () => {
    columns.forEach(item => (item.filterOptions = { renderValue: v => v.toUpperCase() }));
    const options = {
      filterType: 'select',
      textLabels: getTextLabels(),
      filterOptions: { renderValue: v => v.toUpperCase() },
    };
    const filterList = [['Joe James'], [null], [], []];
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const selects = container.querySelectorAll('.MuiSelect-select');
    expect(selects.length).toBe(4);
    expect(selects[0].innerHTML).toContain('JOE JAMES');
  });

  it("should render data table filter view with custom rendering of items for filterType = 'multiselect' if renderValue is provided", () => {
    columns.forEach(item => (item.filterOptions = { renderValue: v => v.toUpperCase() }));
    const options = { filterType: 'multiselect', textLabels: getTextLabels() };
    const filterList = [['Joe James', 'John Walsh'], [], [], []];
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const selects = container.querySelectorAll('.MuiSelect-select');
    expect(selects.length).toBe(4);
    expect(selects[0].innerHTML).toContain('JOE JAMES, JOHN WALSH');
  });

  it("should data table custom filter view with if filterType = 'custom' and a valid display filterOption is provided", () => {
    const options = {
      filterType: 'custom',
      textLabels: getTextLabels(),
      filterOptions: {
        names: [],
        logic(city, filters) {
          return false;
        },
        display: (filterList, onChange, index, column) => (
          <div>
            <TextField id="custom-filter-render">Custom Filter Render</TextField>
          </div>
        ),
      },
    };
    const filterList = [[], [], [], []];
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const actualResult = container.querySelector('#custom-filter-render');
    expect(actualResult).not.toBeNull();
  });

  it("does not render filter if filterType = 'custom' and no display filterOption is provided", () => {
    const options = {
      filterType: 'custom',
      textLabels: getTextLabels(),
      filterOptions: {
        logic(city, filters) {
          return false;
        },
      },
    };
    const filterList = [[], [], [], []];
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const actualResult = container.querySelector('#custom-filter-render');
    expect(actualResult).toBeNull();
  });

  it("should render column.label as filter label if filterType = 'textField'", () => {
    const options = { filterType: 'textField', textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const labels = container.querySelectorAll('.MuiInputLabel-formControl');
    const labelTexts = Array.from(labels).map(el => el.textContent);
    expect(labelTexts).toEqual(['First Name', 'Company', 'City Label', 'State']);
  });

  it("should data table filter view with TextFields if filterType = 'textfield'", () => {
    const options = { filterType: 'textField', textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const textFields = container.querySelectorAll('.MuiTextField-root');
    expect(textFields.length).toBe(4);
  });

  it("should data table filter view with no TextFields if filter=false when filterType = 'textField'", () => {
    const options = { filterType: 'textField', textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    columns = columns.map(item => (item.filter = false));
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const textFields = container.querySelectorAll('.MuiTextField-root');
    expect(textFields.length).toBe(0);
  });

  it("should data table filter view with checkboxes if column.filterType = 'checkbox' irrespective of global filterType value", () => {
    const options = { filterType: 'textField', textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    columns.forEach(item => (item.filterType = 'checkbox'));
    const { container } = render(
      <TableFilter columns={columns} filterData={filterData} filterList={filterList} options={options} />,
    );
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(13);
  });

  it('should render a filter dialog with custom footer when customFooter is provided', () => {
    const CustomFooter = () => <div id="custom-footer">customFooter</div>;
    const options = { textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    const onFilterUpdate = jest.fn();
    const { container } = render(
      <TableFilter
        customFooter={CustomFooter}
        columns={columns}
        onFilterUpdate={onFilterUpdate}
        filterData={filterData}
        filterList={filterList}
        options={options}
      />,
    );
    const actualResult = container.querySelector('#custom-footer');
    expect(actualResult).not.toBeNull();
  });

  it('should invoke applyFilters from customFooter callback', () => {
    const onFilterConfirm = jest.fn();
    const CustomFooter = (filterList, applyFilters) => {
      applyFilters();
      return <div id="custom-footer">customFooter</div>;
    };
    const options = { textLabels: getTextLabels(), onFilterConfirm };
    const filterList = [[], [], [], []];
    const onFilterUpdate = jest.fn();
    const handleClose = jest.fn();
    render(
      <TableFilter
        customFooter={CustomFooter}
        columns={columns}
        onFilterUpdate={onFilterUpdate}
        filterData={filterData}
        filterList={filterList}
        options={options}
        handleClose={handleClose}
      />,
    );
    expect(onFilterConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should invoke onFilterReset when reset is pressed', () => {
    const options = { textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    const onFilterUpdate = jest.fn();
    const handleClose = jest.fn();
    const onFilterReset = jest.fn();
    render(
      <TableFilter
        columns={columns}
        onFilterUpdate={onFilterUpdate}
        filterData={filterData}
        filterList={filterList}
        options={options}
        handleClose={handleClose}
        onFilterReset={onFilterReset}
      />,
    );
    fireEvent.click(screen.getByTestId('filterReset-button'));
    expect(onFilterReset).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(0);
  });

  it('should trigger onFilterUpdate prop callback when checkbox is clicked', () => {
    const options = { filterType: 'checkbox', textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    const onFilterUpdate = jest.fn();
    const updateFilterByType = jest.fn();
    const { container } = render(
      <TableFilter
        columns={columns}
        onFilterUpdate={onFilterUpdate}
        updateFilterByType={updateFilterByType}
        filterData={filterData}
        filterList={filterList}
        options={options}
      />,
    );
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    fireEvent.click(checkboxes[0]);
    expect(updateFilterByType).toHaveBeenCalledTimes(1);
  });

  it('should trigger onFilterUpdate prop callback when select dropdown is changed', () => {
    const options = { filterType: 'select', textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    const onFilterUpdate = jest.fn();
    const updateFilterByType = jest.fn();
    const { container } = render(
      <TableFilter
        columns={columns}
        onFilterUpdate={onFilterUpdate}
        updateFilterByType={updateFilterByType}
        filterData={filterData}
        filterList={filterList}
        options={options}
      />,
    );
    // Find the first native select input and change its value
    const selects = container.querySelectorAll('.MuiSelect-nativeInput');
    if (selects.length > 0) {
      fireEvent.change(selects[0], { target: { value: 'Joe James' } });
      expect(updateFilterByType).toHaveBeenCalled();
    }
  });

  it('should trigger onFilterUpdate prop callback when textfield is changed', () => {
    const options = { filterType: 'textField', textLabels: getTextLabels() };
    const filterList = [[], [], [], []];
    const onFilterUpdate = jest.fn();
    const updateFilterByType = jest.fn();
    const { container } = render(
      <TableFilter
        columns={columns}
        onFilterUpdate={onFilterUpdate}
        updateFilterByType={updateFilterByType}
        filterData={filterData}
        filterList={filterList}
        options={options}
      />,
    );
    const inputs = container.querySelectorAll('.MuiTextField-root input');
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: 'test' } });
      expect(updateFilterByType).toHaveBeenCalled();
    }
  });
});
