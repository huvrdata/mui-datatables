import React from 'react';
import { render, screen } from './test-utils';
import TableSelectCell from '../src/components/TableSelectCell';

describe('<TableSelectCell />', function () {
  beforeAll(() => {});

  it('should render table select cell', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableSelectCell checked={false} selectableOn={'multiple'} isRowSelectable={true} />
          </tr>
        </tbody>
      </table>,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('should render table select cell checked', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableSelectCell checked={true} selectableOn={'multiple'} isRowSelectable={true} />
          </tr>
        </tbody>
      </table>,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should render table select cell unchecked', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableSelectCell checked={false} selectableOn={'multiple'} isRowSelectable={true} />
          </tr>
        </tbody>
      </table>,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });
});
