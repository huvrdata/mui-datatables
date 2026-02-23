import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../utils/layout';
import { makeStyles } from 'tss-react/mui';
import allExamples from '../../examples/examples';

const descriptions = {
  'Array Value Columns': 'Filter and display array-type column values using multiselect filters and chip rendering.',
  'Column Filters': 'Apply initial filters, customize per-column filter options, and respond to filter changes with callbacks.',
  'Column Option Update': 'Dynamically update column options like filterOptions, filterList, and visibility at runtime.',
  'Column Sort': 'Implement custom sort comparators to handle non-standard data types like string-encoded ages and arrays.',
  'Component': 'Render editable components (TextFields, Selects, Switches) inside table cells using customBodyRender.',
  'CSV Export': 'Customize CSV download formatting with onDownload, downloadOptions, and column-level CSV display control.',
  'Custom Action Columns': 'Add Edit, Delete, and Add action buttons to rows using empty columns with customBodyRenderLite.',
  'Custom Components': 'Override built-in components like the filter list, tooltips, checkboxes, and view-columns dialog.',
  'Customize Columns': 'Control column labels, display visibility, and per-column filter/sort behavior.',
  'Customize Filter': 'Build custom filter UIs with dropdown, textField, custom logic, and checkbox filter types.',
  'Customize Footer': 'Replace the default footer with a custom component and add aggregate calculations in the table body footer.',
  'Customize Rows': 'Use customRowRender to display expanded card-like layouts for each row.',
  'Customize Search': 'Control search behavior with customSearch functions, searchProps, and initial search text.',
  'Customize Search Render': 'Replace the default search bar with a fully custom search input component.',
  'Customize Sorting': 'Use customSort for client-side sorting logic with sortOrder, sortThirdClickReset, and sortDescFirst options.',
  'Customize Styling': 'Apply custom themes via ThemeProvider and conditional cell/row styles with setCellProps and setRowProps.',
  'Customize Toolbar': 'Add custom buttons and actions to the toolbar using the customToolbar option.',
  'Customize Toolbar Icons': 'Override the default toolbar icons for Search, Print, Download, ViewColumn, and Filter.',
  'Customize Toolbar Select': 'Customize the selection toolbar with custom actions and selectToolbarPlacement options.',
  'Data As Objects': 'Use nested data objects with enableNestedDataAccess and dot notation for deep property access.',
  'Draggable Columns': 'Enable drag-and-drop column reordering using the draggableColumns option with react-dnd.',
  'Expandable Rows': 'Add expandable row content with renderExpandableRow, isRowExpandable, and expansion state control.',
  'Fixed Header': 'Keep table headers fixed while scrolling with fixedHeader, fixedSelectColumn, and tableBodyHeight.',
  'Hide Columns Print': 'Control which columns appear in print output using the print column option.',
  'Infinite Scrolling': 'Load additional data on scroll using Waypoint to trigger data fetching near the table bottom.',
  'Large Data Set': 'Optimize performance for 5000+ rows with debounceSearchRender, jumpToPage, and customBodyRenderLite.',
  'OnDownload': 'Intercept and customize CSV export output with the onDownload callback.',
  'OnTableInit': 'Access table state on initialization and monitor changes with onTableInit and onTableChange callbacks.',
  'Resizable Columns': 'Enable column width resizing with the resizableColumns option.',
  'Selectable Rows': 'Configure row selection with selectableRows, isRowSelectable, hide checkboxes, and selection callbacks.',
  'ServerSide Filters': 'Implement server-side filtering with confirmFilters, customFilterDialogFooter, and filter confirm/reset.',
  'ServerSide Pagination': 'Handle pagination server-side with onTableChange, managing page/sort state and loading indicators.',
  'ServerSide Sorting': 'Implement server-side sorting with onColumnSortChange and onChangePage callbacks.',
  'Simple': 'Basic table with toggleable toolbar features: search, download, print, view columns, and filter.',
  'Simple No Toolbar': 'Minimal table with all toolbar features disabled.',
  'Text Localization': 'Customize all UI text labels for internationalization using the textLabels option.',
  'Themes': 'Apply a dark theme to the table using ThemeProvider with createTheme.',
};

const useStyles = makeStyles()(theme => ({
  container: {
    marginTop: theme.spacing(2),
  },
  card: {
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      background: theme.palette.grey[200],
    },
  },
  cardContent: {
    padding: theme.spacing(1.5),
    '&:last-child': {
      paddingBottom: theme.spacing(1.5),
    },
  },
  cardDescription: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  backButton: {
    marginBottom: theme.spacing(2),
  },
  description: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
  search: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

function toSlug(name) {
  return name.replace(/\s+/g, '-').toLowerCase();
}

function ExamplesPage() {
  const { classes } = useStyles();
  const [selected, setSelected] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const match = Object.keys(allExamples).find(k => toSlug(k) === hash);
      if (match) setSelected(match);
    }

    const onHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (!h) {
        setSelected(null);
      } else {
        const m = Object.keys(allExamples).find(k => toSlug(k) === h);
        if (m) setSelected(m);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleSelect = name => {
    window.location.hash = toSlug(name);
    setSelected(name);
  };

  const handleBack = () => {
    window.location.hash = '';
    setSelected(null);
  };

  if (selected) {
    const ExampleComponent = allExamples[selected];
    return (
      <Layout>
        <Button
          className={classes.backButton}
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          size="small">
          Back to Examples
        </Button>
        <Typography variant="h5" gutterBottom>
          {selected}
        </Typography>
        {descriptions[selected] && (
          <Typography variant="body2" className={classes.description}>
            {descriptions[selected]}
          </Typography>
        )}
        <ExampleComponent />
      </Layout>
    );
  }

  const sortedKeys = Object.keys(allExamples)
    .sort()
    .filter(k => !searchVal || k.toLowerCase().includes(searchVal.toLowerCase()));

  return (
    <Layout>
      <Typography variant="h5" align="center" gutterBottom>
        Examples
      </Typography>
      <Typography variant="subtitle2" align="center" gutterBottom>
        {sortedKeys.length} examples
      </Typography>
      <div className={classes.search}>
        <TextField
          placeholder="Search examples..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          size="small"
        />
      </div>
      <Grid container className={classes.container} spacing={1}>
        {sortedKeys.map(label => (
          <Grid key={label} item xs={12} sm={6} md={4}>
            <Card className={classes.card} onClick={() => handleSelect(label)}>
              <CardContent className={classes.cardContent}>
                <Typography variant="subtitle2">
                  {label}
                </Typography>
                {descriptions[label] && (
                  <Typography variant="caption" className={classes.cardDescription}>
                    {descriptions[label]}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export default ExamplesPage;
