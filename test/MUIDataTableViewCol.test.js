import React from 'react';
import { render, screen, fireEvent } from './test-utils';
import TableViewCol from '../src/components/TableViewCol';
import getTextLabels from '../src/textLabels';

describe('<TableViewCol />', function() {
  let columns;
  let options;

  beforeAll(() => {
    columns = [
      { name: 'a', label: 'A', display: 'true' },
      { name: 'b', label: 'B', display: 'true' },
      { name: 'c', label: 'C', display: 'true' },
      { name: 'd', label: 'D', display: 'true' },
    ];
    options = {
      textLabels: getTextLabels(),
    };
  });

  it('should render view columns', () => {
    render(<TableViewCol columns={columns} options={options} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
  });

  it('should labels as view column names when present', () => {
    render(<TableViewCol columns={columns} options={options} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('should trigger onColumnUpdate prop callback when calling method handleColChange', () => {
    const onColumnUpdate = jest.fn();

    render(<TableViewCol columns={columns} onColumnUpdate={onColumnUpdate} options={options} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(onColumnUpdate).toHaveBeenCalledTimes(1);
  });
});
