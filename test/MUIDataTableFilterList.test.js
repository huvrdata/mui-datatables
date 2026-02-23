import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TableFilterList from '../src/components/TableFilterList';
import getTextLabels from '../src/textLabels';

describe('<TableFilterList />', function () {
  let data;
  let columns;
  let filterData;

  beforeEach(() => {
    columns = [
      { name: 'name', label: 'Name', display: true, sort: true, filter: true },
      { name: 'company', label: 'Company', display: true, sort: true, filter: true },
      { name: 'city', label: 'City Label', display: true, sort: true, filter: true },
      { name: 'state', label: 'State', display: true, sort: true, filter: true },
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

  it('should render a filter chip for a filter', () => {
    const options = { textLabels: getTextLabels() };
    const filterList = [['Joe James'], [], [], []];
    const filterUpdate = jest.fn();
    const columnNames = columns.map((column) => ({
      name: column.name,
      filterType: column.filterType || options.filterType,
    }));

    const { container } = render(
      <TableFilterList
        options={options}
        filterListRenderers={columns.map((c) => {
          if (c.customFilterListOptions && c.customFilterListOptions.render) return c.customFilterListOptions.render;
          if (c.customFilterListRender) return c.customFilterListRender;
          return (f) => f;
        })}
        customFilterListUpdate={columns.map((c) => {
          return c.customFilterListOptions && c.customFilterListOptions.update
            ? c.customFilterListOptions.update
            : null;
        })}
        filterList={filterList}
        filterUpdate={filterUpdate}
        columnNames={columnNames}
      />,
    );

    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(1);
  });

  it('should place a class onto the filter chip', () => {
    const options = {
      textLabels: getTextLabels(),
      setFilterChipProps: (a, b, c) => {
        return {
          className: 'testClass123',
        };
      },
    };
    const filterList = [['Joe James'], [], [], []];
    const filterUpdate = jest.fn();
    const columnNames = columns.map((column) => ({
      name: column.name,
      filterType: column.filterType || options.filterType,
    }));

    const { container } = render(
      <TableFilterList
        options={options}
        filterListRenderers={columns.map((c) => {
          if (c.customFilterListOptions && c.customFilterListOptions.render) return c.customFilterListOptions.render;
          if (c.customFilterListRender) return c.customFilterListRender;
          return (f) => f;
        })}
        customFilterListUpdate={columns.map((c) => {
          return c.customFilterListOptions && c.customFilterListOptions.update
            ? c.customFilterListOptions.update
            : null;
        })}
        filterList={filterList}
        filterUpdate={filterUpdate}
        columnNames={columnNames}
      />,
    );

    const chipsWithClass = container.querySelectorAll('.testClass123');
    expect(chipsWithClass.length).toBe(1);
  });

  it('should remove a filter chip and call onFilterChipClose when its X icon is clicked', () => {
    const onFilterChipClose = jest.fn();
    const options = {
      textLabels: getTextLabels(),
      onFilterChipClose,
    };
    const filterList = [['Joe James'], [], [], []];
    const filterUpdateCall = jest.fn();
    const filterUpdate = (index, filterValue, columnName, filterType, tmp, next) => {
      filterUpdateCall();
      next();
    };
    const columnNames = columns.map((column) => ({
      name: column.name,
      filterType: column.filterType || options.filterType,
    }));

    const { container } = render(
      <TableFilterList
        options={options}
        filterListRenderers={columns.map((c) => {
          if (c.customFilterListOptions && c.customFilterListOptions.render) return c.customFilterListOptions.render;
          if (c.customFilterListRender) return c.customFilterListRender;
          return (f) => f;
        })}
        customFilterListUpdate={columns.map((c) => {
          return c.customFilterListOptions && c.customFilterListOptions.update
            ? c.customFilterListOptions.update
            : null;
        })}
        filterList={filterList}
        filterUpdate={filterUpdate}
        columnNames={columnNames}
      />,
    );

    const deleteIcon = container.querySelector('.MuiChip-deleteIcon');
    fireEvent.click(deleteIcon);

    expect(filterUpdateCall).toHaveBeenCalledTimes(1);
    expect(onFilterChipClose).toHaveBeenCalledTimes(1);
  });

  it('should correctly call customFilterListOptions.render and customFilterListOptions.update', () => {
    const renderCall = jest.fn();
    const updateCall = jest.fn();
    const columnsWithCustomFilterListOptions = [
      {
        name: 'name',
        label: 'Name',
        display: true,
        sort: true,
        filter: true,
        filterType: 'custom',
        customFilterListOptions: {
          render: () => {
            renderCall();
            return 'label!';
          },
          update: () => {
            updateCall();
            return [];
          },
        },
      },
      { name: 'company', label: 'Company', display: true, sort: true, filter: true, sortDirection: 'desc' },
      { name: 'city', label: 'City Label', display: true, sort: true, filter: true, sortDirection: 'desc' },
      { name: 'state', label: 'State', display: true, sort: true, filter: true, sortDirection: 'desc' },
    ];

    const onFilterChipClose = jest.fn();
    const options = {
      textLabels: getTextLabels(),
      onFilterChipClose,
    };
    const filterList = [['Joe James'], [], [], []];
    const filterUpdateCall = jest.fn();
    const filterUpdate = (index, filterValue, columnName, filterType, customUpdate, next) => {
      if (customUpdate) customUpdate();
      filterUpdateCall();
      next();
    };
    const columnNames = columnsWithCustomFilterListOptions.map((column) => ({
      name: column.name,
      filterType: column.filterType || options.filterType,
    }));

    const { container } = render(
      <TableFilterList
        options={options}
        filterListRenderers={columnsWithCustomFilterListOptions.map((c) => {
          if (c.customFilterListOptions && c.customFilterListOptions.render) return c.customFilterListOptions.render;
          if (c.customFilterListRender) return c.customFilterListRender;
          return (f) => f;
        })}
        customFilterListUpdate={columnsWithCustomFilterListOptions.map((c) => {
          return c.customFilterListOptions && c.customFilterListOptions.update
            ? c.customFilterListOptions.update
            : null;
        })}
        filterList={filterList}
        filterUpdate={filterUpdate}
        columnNames={columnNames}
      />,
    );

    expect(renderCall).toHaveBeenCalledTimes(1);
    expect(updateCall).toHaveBeenCalledTimes(0);

    const deleteIcon = container.querySelector('.MuiChip-deleteIcon');
    fireEvent.click(deleteIcon);

    expect(renderCall).toHaveBeenCalledTimes(1);
    expect(updateCall).toHaveBeenCalledTimes(1);
  });
});
