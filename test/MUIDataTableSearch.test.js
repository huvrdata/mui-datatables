import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TableSearch from '../src/components/TableSearch';
import getTextLabels from '../src/textLabels';

describe('<TableSearch />', function() {
  it('should render a search bar', () => {
    const options = { textLabels: getTextLabels() };
    const onSearch = () => {};
    const onHide = () => {};

    render(<TableSearch onSearch={onSearch} onHide={onHide} options={options} />);

    const input = screen.getByRole('textbox', { name: 'Search' });
    expect(input).toBeTruthy();
  });

  it('should render a search bar with text initialized', () => {
    const options = { textLabels: getTextLabels() };
    const onSearch = () => {};
    const onHide = () => {};

    render(<TableSearch onSearch={onSearch} onHide={onHide} options={options} searchText="searchText" />);

    const input = screen.getByRole('textbox', { name: 'Search' });
    expect(input).toBeTruthy();
    expect(input.value).toBe('searchText');
  });

  it('should change search bar text when searchText changes', () => {
    const options = { textLabels: getTextLabels() };
    const onSearch = () => {};
    const onHide = () => {};

    const { rerender } = render(
      <TableSearch onSearch={onSearch} onHide={onHide} options={options} searchText="searchText" />,
    );

    rerender(<TableSearch onSearch={onSearch} onHide={onHide} options={options} searchText="nextText" />);

    const input = screen.getByRole('textbox', { name: 'Search' });
    expect(input.value).toBe('nextText');
  });

  it('should render a search bar with placeholder when searchPlaceholder is set', () => {
    const options = { textLabels: getTextLabels(), searchPlaceholder: 'TestingPlaceholder' };
    const onSearch = () => {};
    const onHide = () => {};

    render(<TableSearch onSearch={onSearch} onHide={onHide} options={options} />);

    const input = screen.getByPlaceholderText('TestingPlaceholder');
    expect(input).toBeTruthy();
  });

  it('should trigger handleTextChange prop callback when calling method handleTextChange', () => {
    const options = { onSearchChange: () => true, textLabels: getTextLabels() };
    const onSearch = jest.fn();
    const onHide = () => {};

    render(<TableSearch onSearch={onSearch} onHide={onHide} options={options} />);

    const input = screen.getByRole('textbox', { name: 'Search' });
    fireEvent.change(input, { target: { value: 'test' } });

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('should hide the search bar when hitting the ESCAPE key', () => {
    const options = { textLabels: getTextLabels() };
    const onHide = jest.fn();

    render(<TableSearch onHide={onHide} options={options} />);

    const input = screen.getByRole('textbox', { name: 'Search' });
    fireEvent.keyDown(input, { key: 'Escape', keyCode: 27 });

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('should not hide search bar when entering anything but the ESCAPE key', () => {
    const options = { textLabels: getTextLabels() };
    const onHide = jest.fn();

    render(<TableSearch onHide={onHide} options={options} />);

    const input = screen.getByRole('textbox', { name: 'Search' });
    fireEvent.keyDown(input, { key: 'a', keyCode: 25 });

    expect(onHide).toHaveBeenCalledTimes(0);
  });
});
