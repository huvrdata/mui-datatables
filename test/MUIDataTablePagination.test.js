import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import getTextLabels from '../src/textLabels';
import TablePagination from '../src/components/TablePagination';

describe('<TablePagination />', function () {
  let options;

  beforeAll(() => {
    options = {
      rowsPerPageOptions: [5, 10, 15],
      textLabels: getTextLabels(),
    };
  });

  it('should render a table footer with pagination', () => {
    const { container } = render(
      <table>
        <TablePagination options={options} count={100} page={1} rowsPerPage={10} changeRowsPerPage={() => {}} />
      </table>,
    );

    // MuiTablePagination renders a div with class MuiTablePagination-root
    const pagination = container.querySelectorAll('.MuiTablePagination-root');
    expect(pagination.length).toBe(1);
  });

  it('should trigger changePage prop callback when page is changed', () => {
    const changePage = jest.fn();
    render(
      <table>
        <TablePagination
          options={options}
          count={100}
          page={1}
          rowsPerPage={10}
          changePage={changePage}
          changeRowsPerPage={() => {}}
        />
      </table>,
    );

    const nextButton = screen.getByTestId('pagination-next');
    fireEvent.click(nextButton);

    expect(changePage).toHaveBeenCalledTimes(1);
  });

  it('should correctly change page to be in bounds if out of bounds page was set', () => {
    // Set a page that is too high for the count and rowsPerPage
    const { container } = render(
      <table>
        <TablePagination options={options} count={5} page={1} rowsPerPage={10} changeRowsPerPage={() => {}} />
      </table>,
    );

    // The displayed text should show "1-5" indicating page 0 (first page), not page 1
    const paginationDisplay = container.querySelector('.MuiTablePagination-displayedRows');
    expect(paginationDisplay.textContent).toContain('1-5');
  });
});
