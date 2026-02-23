import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TableToolbar from '../src/components/TableToolbar';
import getTextLabels from '../src/textLabels';

describe('<TableToolbar />', function () {
  let data;
  let columns;
  let options;
  let setTableAction = () => {};

  beforeAll(() => {
    options = {
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
    columns = ['First Name', 'Company', 'City', 'State'];
    data = [
      { data: ['Joe James', 'Test Corp', 'Yonkers', 'NY'], dataIndex: 0 },
      { data: ['John Walsh', 'Test Corp', 'Hartford', 'CT'], dataIndex: 1 },
      { data: ['Bob Herm', 'Test Corp', 'Tampa', 'FL'], dataIndex: 2 },
      { data: ['James Houston', 'Test Corp', 'Dallas', 'TX'], dataIndex: 3 },
    ];
  });

  it('should render a toolbar', () => {
    const { container } = render(
      <TableToolbar columns={columns} data={data} options={options} setTableAction={setTableAction} />,
    );
    const iconButtons = container.querySelectorAll('.MuiIconButton-root');
    expect(iconButtons.length).toBe(5);
  });

  it('should render a toolbar with custom title if title is not string', () => {
    const title = <h1>custom title</h1>;
    render(
      <TableToolbar title={title} columns={columns} data={data} options={options} setTableAction={setTableAction} />,
    );
    expect(screen.getByText('custom title')).toBeInTheDocument();
  });

  it('should render a toolbar with search text initialized if option.searchText = some_text', () => {
    const newOptions = { ...options, search: true, searchText: 'searchText' };
    render(
      <TableToolbar
        columns={columns}
        data={data}
        options={newOptions}
        setTableAction={setTableAction}
        searchText="searchText"
      />,
    );
    const searchInput = screen.getByRole('textbox', { name: 'Search' });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.value).toBe('searchText');
  });

  it('should render a toolbar with search if option.searchOpen = true', () => {
    const newOptions = { ...options, searchOpen: true };
    render(<TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('should render a toolbar with no search icon if option.search = false', () => {
    const newOptions = { ...options, search: false };
    const { container } = render(
      <TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />,
    );
    expect(container.querySelector('[data-testid="Search-iconButton"]')).toBeNull();
  });

  it('should render a toolbar with search box and no search icon if option.searchAlwaysOpen = true', () => {
    const newOptions = { ...options, searchAlwaysOpen: true };
    const { container } = render(
      <TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />,
    );
    // Search input should be rendered
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
    // Search icon button should not be rendered
    expect(container.querySelector('[data-testid="Search-iconButton"]')).toBeNull();
  });

  it('should render a toolbar with no download icon if option.download = false', () => {
    const newOptions = { ...options, download: false };
    const { container } = render(
      <TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />,
    );
    expect(container.querySelector('[data-testid="DownloadCSV-iconButton"]')).toBeNull();
  });

  it('should render a toolbar with no print icon if option.print = false', () => {
    const newOptions = { ...options, print: false };
    const { container } = render(
      <TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />,
    );
    expect(container.querySelector('[data-testid="Print-iconButton"]')).toBeNull();
  });

  it('should render a toolbar with no view columns icon if option.viewColumns = false', () => {
    const newOptions = { ...options, viewColumns: false };
    const { container } = render(
      <TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />,
    );
    expect(container.querySelector('[data-testid="ViewColumns-iconButton"]')).toBeNull();
  });

  it('should render a toolbar with no filter icon if option.filter = false', () => {
    const newOptions = { ...options, filter: false };
    const { container } = render(
      <TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />,
    );
    expect(container.querySelector('[data-testid="Filter Table-iconButton"]')).toBeNull();
  });

  it('should render a toolbar with a search when clicking search icon', () => {
    render(<TableToolbar columns={columns} data={data} options={options} setTableAction={setTableAction} />);
    fireEvent.click(screen.getByTestId('Search-iconButton'));
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('should hide search after clicking cancel icon', () => {
    const searchTextUpdate = () => {};
    render(
      <TableToolbar
        searchClose={() => {}}
        searchTextUpdate={searchTextUpdate}
        columns={columns}
        data={data}
        options={options}
        setTableAction={setTableAction}
      />,
    );
    // Click search to open it
    fireEvent.click(screen.getByTestId('Search-iconButton'));
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();

    // Click the close/clear icon to hide search
    const closeButton = screen.getByTestId('Search-iconButton');
    fireEvent.click(closeButton);
    expect(screen.queryByRole('textbox', { name: 'Search' })).toBeNull();
  });

  it('should render a toolbar with a search when searchAlwaysOpen is set to true', () => {
    const newOptions = { ...options, searchAlwaysOpen: true };
    render(<TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('should not hide search when opening another dialog when searchAlwaysOpen is set to true', () => {
    const newOptions = { ...options, searchAlwaysOpen: true };
    const { container } = render(
      <TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />,
    );
    // Click filter button
    fireEvent.click(screen.getByTestId('Filter Table-iconButton'));
    // Search should still be visible (use container query to avoid aria-modal scope limitation)
    expect(container.querySelector('input[aria-label="Search"]')).not.toBeNull();
  });

  it('should call onFilterDialogOpen when opening filters via toolbar', () => {
    const onFilterDialogOpen = jest.fn();
    const newOptions = { ...options, onFilterDialogOpen };
    render(<TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />);
    fireEvent.click(screen.getByTestId('Filter Table-iconButton'));
    expect(onFilterDialogOpen).toHaveBeenCalledTimes(1);
  });

  it('should call onFilterDialogClose when closing filters dialog', async () => {
    const onFilterDialogClose = jest.fn();
    const newOptions = { ...options, onFilterDialogClose };
    render(<TableToolbar columns={columns} data={data} options={newOptions} setTableAction={setTableAction} />);
    // Open filter
    fireEvent.click(screen.getByTestId('Filter Table-iconButton'));
    // Close filter by clicking the Close button inside the popover
    fireEvent.click(screen.getByLabelText('Close'));
    // Wait for transition to complete and onFilterDialogClose to fire
    await waitFor(() => {
      expect(onFilterDialogClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should download CSV when clicking download button', () => {
    render(
      <TableToolbar
        columns={columns}
        displayData={data}
        data={data}
        options={options}
        setTableAction={setTableAction}
      />,
    );

    const appendSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    const removeSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    fireEvent.click(screen.getByTestId('DownloadCSV-iconButton'));

    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();

    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('should trigger onDownload prop callback when clicking download button', () => {
    const onDownload = jest.fn();
    const newOptions = { ...options, onDownload };

    render(
      <TableToolbar
        columns={columns}
        displayData={data}
        data={data}
        options={newOptions}
        setTableAction={setTableAction}
      />,
    );

    fireEvent.click(screen.getByTestId('DownloadCSV-iconButton'));

    expect(onDownload).toHaveBeenCalledTimes(1);
  });
});
