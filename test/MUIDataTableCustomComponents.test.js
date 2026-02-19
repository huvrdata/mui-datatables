import React from 'react';
import { render, screen } from './test-utils';
import MUIDataTable from '../src/MUIDataTable';
import Chip from '@mui/material/Chip';
import TableFilterList from '../src/components/TableFilterList';

const CustomChip = props => {
  return <Chip variant="outlined" color="secondary" label={props.label} data-testid="custom-chip" />;
};

const CustomFilterList = props => {
  return (
    <div data-testid="custom-filter-list">
      <TableFilterList {...props} ItemComponent={CustomChip} />
    </div>
  );
};

describe('<MUIDataTable /> with custom components', function() {
  let data;
  let columns;

  beforeAll(() => {
    columns = [
      { name: 'Name' },
      {
        name: 'Company',
        options: {
          filter: true,
          filterType: 'custom',
          filterList: ['Test Corp'],
        },
      },
      { name: 'City', label: 'City Label' },
      { name: 'State' },
      { name: 'Empty', options: { empty: true, filterType: 'checkbox' } },
    ];
    data = [
      ['Joe James', 'Test Corp', 'Yonkers', 'NY'],
      ['John Walsh', 'Test Corp', 'Hartford', null],
      ['Bob Herm', 'Test Corp', 'Tampa', 'FL'],
      ['James Houston', 'Test Corp', 'Dallas', 'TX'],
    ];
  });

  it('should render a table with custom Chip in TableFilterList', () => {
    render(
      <MUIDataTable
        columns={columns}
        data={data}
        components={{
          TableFilterList: CustomFilterList,
        }}
      />,
    );

    const customFilterList = screen.getByTestId('custom-filter-list');
    expect(customFilterList).toBeInTheDocument();

    const customChips = screen.getAllByTestId('custom-chip');
    expect(customChips).toHaveLength(1);
  });
});
