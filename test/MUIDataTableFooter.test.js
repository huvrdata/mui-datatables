import React from 'react';
import { render, screen } from './test-utils';
import MuiTableFooter from '@mui/material/TableFooter';
import getTextLabels from '../src/textLabels';
import TableFooter from '../src/components/TableFooter';

describe('<TableFooter />', function () {
  let options;
  const changeRowsPerPage = jest.fn();
  const changePage = jest.fn();

  beforeAll(() => {
    options = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
    };
  });

  it('should render a table footer', () => {
    const { container } = render(
      <TableFooter
        options={options}
        rowCount={100}
        page={1}
        rowsPerPage={10}
        changeRowsPerPage={changeRowsPerPage}
        changePage={changePage}
      />,
    );

    // TableFooter renders a MuiTable containing MuiTableFooter with pagination
    // Verify that pagination controls are present (indicating the footer rendered)
    expect(screen.getByTestId('pagination-back')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-next')).toBeInTheDocument();
  });

  it('should render a table footer with customFooter', () => {
    const customOptions = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
      customFooter: (rowCount, page, rowsPerPage, changeRowsPerPage, changePage, textLabels) => {
        return (
          <MuiTableFooter data-testid="custom-footer">
            <tr>
              <td>{`Rows: ${rowCount}`}</td>
            </tr>
          </MuiTableFooter>
        );
      },
    };

    render(
      <TableFooter
        options={customOptions}
        rowCount={100}
        page={1}
        rowsPerPage={10}
        changeRowsPerPage={changeRowsPerPage}
        changePage={changePage}
      />,
    );

    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  it('should not render a table footer', () => {
    const nonPageOption = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
      pagination: false,
    };

    const { container } = render(
      <TableFooter
        options={nonPageOption}
        rowCount={100}
        page={1}
        rowsPerPage={10}
        changeRowsPerPage={changeRowsPerPage}
        changePage={changePage}
      />,
    );

    // When pagination is false and no customFooter, the component returns null
    expect(container.innerHTML).toBe('');
  });

  it('should render a JumpToPage component', () => {
    const jumpToPageOptions = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
      jumpToPage: true,
    };

    render(
      <TableFooter
        options={jumpToPageOptions}
        rowCount={100}
        page={1}
        rowsPerPage={10}
        changeRowsPerPage={changeRowsPerPage}
        changePage={changePage}
      />,
    );

    // JumpToPage renders the "Jump to Page:" text label
    expect(screen.getByText('Jump to Page:')).toBeInTheDocument();
  });
});
