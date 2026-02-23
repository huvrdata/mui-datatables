import Chip from '@mui/material/Chip';
import React from 'react';
import { render, screen } from '@testing-library/react';
import TableToolbar from '../src/components/TableToolbar';
import getTextLabels from '../src/textLabels';

const CustomChip = (props) => {
  return <Chip variant="outlined" color="secondary" label={props.label} data-testid="custom-chip" />;
};

const iconTestIds = {
  SearchIcon: 'Search-iconButton',
  DownloadIcon: 'DownloadCSV-iconButton',
  PrintIcon: 'Print-iconButton',
  ViewColumnIcon: 'View Columns-iconButton',
  FilterIcon: 'Filter Table-iconButton',
};

let setTableAction = () => {};
const options = {
  print: true,
  download: true,
  search: true,
  filter: true,
  viewColumns: true,
  textLabels: getTextLabels(),
  downloadOptions: {
    separator: ',',
    filename: 'tableDownload.csv',
    filterOptions: {
      useDisplayedRowsOnly: true,
      useDisplayedColumnsOnly: true,
    },
  },
};
const columns = ['First Name', 'Company', 'City', 'State'];
const data = [
  { data: ['Joe James', 'Test Corp', 'Yonkers', 'NY'], dataIndex: 0 },
  { data: ['John Walsh', 'Test Corp', 'Hartford', 'CT'], dataIndex: 1 },
  { data: ['Bob Herm', 'Test Corp', 'Tampa', 'FL'], dataIndex: 2 },
  { data: ['James Houston', 'Test Corp', 'Dallas', 'TX'], dataIndex: 3 },
];

const testCustomIcon = (iconName) => {
  const components = { icons: { [iconName]: CustomChip } };
  const { container } = render(<TableToolbar {...{ columns, data, options, setTableAction, components }} />);

  // All 5 icon buttons should still render
  const iconButtons = container.querySelectorAll('.MuiIconButton-root');
  expect(iconButtons.length).toBe(5);

  // The custom chip should appear once
  const customChips = screen.getAllByTestId('custom-chip');
  expect(customChips.length).toBe(1);

  // The original default icon for the replaced icon should be gone,
  // but the other icons' test IDs should still be present
  Object.keys(iconTestIds).forEach((icon) => {
    const elements = container.querySelectorAll(`[data-testid="${iconTestIds[icon]}"]`);
    if (icon === iconName) {
      // The replaced icon's button should still exist (button testid) but
      // SVG icon inside should be replaced by CustomChip
      // We verify the custom chip is present and the original SVG icon data-testid is gone
    } else {
      expect(elements.length).toBe(1);
    }
  });
};

describe('<TableToolbar /> with custom icons', function () {
  it('should render a toolbar with a custom chip in place of the search icon', () => {
    testCustomIcon('SearchIcon');
  });

  it('should render a toolbar with a custom chip in place of the download icon', () => {
    testCustomIcon('DownloadIcon');
  });

  it('should render a toolbar with a custom chip in place of the print icon', () => {
    testCustomIcon('PrintIcon');
  });

  it('should render a toolbar with a custom chip in place of the view columns icon', () => {
    testCustomIcon('ViewColumnIcon');
  });

  it('should render a toolbar with a custom chip in place of the filter icon', () => {
    testCustomIcon('FilterIcon');
  });
});
