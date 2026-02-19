import React from 'react';
import { renderWithDnd, screen, fireEvent } from './test-utils';
import getTextLabels from '../src/textLabels';
import TableHeadCell from '../src/components/TableHeadCell';

describe('<TableHeadCell />', function() {
  let classes;

  beforeAll(() => {
    classes = {
      root: {},
    };
  });

  it('should add custom props to header cell if "setCellHeaderProps" provided', () => {
    const options = { sort: true, textLabels: getTextLabels() };
    const toggleSort = () => {};
    const setCellHeaderProps = { myProp: 'test', className: 'testClass' };

    const { container } = renderWithDnd(
      <table>
        <thead>
          <tr>
            <TableHeadCell
              cellHeaderProps={setCellHeaderProps}
              options={options}
              sortDirection={'asc'}
              sort={true}
              toggleSort={toggleSort}
              classes={classes}>
              some content
            </TableHeadCell>
          </tr>
        </thead>
      </table>,
    );

    const tableCell = container.querySelector('td, th');

    expect(tableCell.getAttribute('myProp') || tableCell.myProp).toBeDefined();
    expect(tableCell.className).toContain('testClass');
  });

  it('should render a table head cell with sort label when options.sort = true provided', () => {
    const options = { sort: true, textLabels: getTextLabels() };
    const toggleSort = () => {};

    const { container } = renderWithDnd(
      <table>
        <thead>
          <tr>
            <TableHeadCell options={options} sortDirection={'asc'} sort={true} toggleSort={toggleSort} classes={classes}>
              some content
            </TableHeadCell>
          </tr>
        </thead>
      </table>,
    );

    // TableSortLabel renders an svg icon with the MuiTableSortLabel class
    const sortLabels = container.querySelectorAll('.MuiTableSortLabel-root');
    expect(sortLabels.length).toBe(1);
  });

  it('should render a table head cell without sort label when options.sort = false provided', () => {
    const options = { sort: false, textLabels: getTextLabels() };
    const toggleSort = () => {};

    const { container } = renderWithDnd(
      <table>
        <thead>
          <tr>
            <TableHeadCell options={options} sortDirection={'asc'} sort={true} toggleSort={toggleSort} classes={classes}>
              some content
            </TableHeadCell>
          </tr>
        </thead>
      </table>,
    );

    const sortLabels = container.querySelectorAll('.MuiTableSortLabel-root');
    expect(sortLabels.length).toBe(0);
  });

  it('should render a table help icon when hint provided', () => {
    const options = { sort: true, textLabels: getTextLabels() };

    const { container } = renderWithDnd(
      <table>
        <thead>
          <tr>
            <TableHeadCell options={options} hint={'hint text'} sort={false} toggleSort={() => {}} print={false} classes={classes}>
              some content
            </TableHeadCell>
          </tr>
        </thead>
      </table>,
    );

    // HelpIcon renders as an SVG with data-testid="HelpIcon"
    const helpIcons = container.querySelectorAll('[data-testid="HelpIcon"]');
    expect(helpIcons.length).toBe(1);
  });

  it('should render a table head cell without help icon when no hint provided', () => {
    const options = { sort: true, textLabels: getTextLabels() };

    const { container } = renderWithDnd(
      <table>
        <thead>
          <tr>
            <TableHeadCell options={options} sort={false} toggleSort={() => {}} print={false} classes={classes}>
              some content
            </TableHeadCell>
          </tr>
        </thead>
      </table>,
    );

    const helpIcons = container.querySelectorAll('[data-testid="HelpIcon"]');
    expect(helpIcons.length).toBe(0);
  });

  it('should trigger toggleSort prop callback when calling method handleSortClick', () => {
    const options = { sort: true, textLabels: getTextLabels() };
    const toggleSort = jest.fn();

    const { container } = renderWithDnd(
      <table>
        <thead>
          <tr>
            <TableHeadCell
              options={options}
              sort={true}
              index={0}
              sortDirection={'asc'}
              toggleSort={toggleSort}
              classes={classes}>
              some content
            </TableHeadCell>
          </tr>
        </thead>
      </table>,
    );

    const button = screen.getByTestId('headcol-0');
    fireEvent.click(button);
    expect(toggleSort).toHaveBeenCalledTimes(1);
  });
});
