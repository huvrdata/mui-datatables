import React, { useCallback } from 'react';
import clsx from 'clsx';
import TableCell from '@mui/material/TableCell';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles({ name: 'MUIDataTableBodyCell' })(theme => ({
  root: {},
  cellHide: {
    display: 'none',
  },
  simpleHeader: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline-block',
      fontWeight: 'bold',
      width: '100%',
      boxSizing: 'border-box',
    },
  },
  simpleCell: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline-block',
      width: '100%',
      boxSizing: 'border-box',
    },
  },
  stackedHeader: {
    verticalAlign: 'top',
  },
  stackedCommon: {
    [theme.breakpoints.down('md')]: {
      display: 'inline-block',
      fontSize: '16px',
      height: 'auto',
      width: 'calc(50%)',
      boxSizing: 'border-box',
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:nth-last-of-type(2)': {
        borderBottom: 'none',
      },
    },
  },
  stackedCommonAlways: {
    display: 'inline-block',
    fontSize: '16px',
    height: 'auto',
    width: 'calc(50%)',
    boxSizing: 'border-box',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:nth-last-of-type(2)': {
      borderBottom: 'none',
    },
  },
  stackedParent: {
    [theme.breakpoints.down('md')]: {
      display: 'inline-block',
      fontSize: '16px',
      height: 'auto',
      width: 'calc(100%)',
      boxSizing: 'border-box',
    },
  },
  stackedParentAlways: {
    display: 'inline-block',
    fontSize: '16px',
    height: 'auto',
    width: 'calc(100%)',
    boxSizing: 'border-box',
  },
}));

function TableBodyCell(props) {
  const { classes } = useStyles();
  const {
    children,
    colIndex,
    columnHeader,
    options,
    dataIndex,
    rowIndex,
    className,
    print,
    tableId,
    ...otherProps
  } = props;
  const onCellClick = options.onCellClick;

  const handleClick = useCallback(
    event => {
      onCellClick(children, { colIndex, rowIndex, dataIndex, event });
    },
    [onCellClick, children, colIndex, rowIndex, dataIndex],
  );

  // Event listeners. Avoid attaching them if they're not necessary.
  let methods = {};
  if (onCellClick) {
    methods.onClick = handleClick;
  }

  let cells = [
    <div
      key={1}
      className={clsx(
        {
          lastColumn: colIndex === 2,
          [classes.root]: true,
          [classes.cellHide]: true,
          [classes.stackedHeader]: true,
          [classes.stackedCommon]: options.responsive === 'vertical',
          [classes.stackedCommonAlways]: options.responsive === 'verticalAlways',
          [classes.simpleHeader]: options.responsive === 'simple',
          'datatables-noprint': !print,
        },
        className,
      )}>
      {columnHeader}
    </div>,
    <div
      key={2}
      className={clsx(
        {
          [classes.root]: true,
          [classes.stackedCommon]: options.responsive === 'vertical',
          [classes.stackedCommonAlways]: options.responsive === 'verticalAlways',
          [classes.simpleCell]: options.responsive === 'simple',
          'datatables-noprint': !print,
        },
        className,
      )}>
      {typeof children === 'function' ? children(dataIndex, rowIndex) : children}
    </div>,
  ];

  var innerCells;
  if (options.responsive === 'standard') {
    innerCells = cells.slice(1, 2);
  } else {
    innerCells = cells;
  }

  return (
    <TableCell
      {...methods}
      data-colindex={colIndex}
      data-tableid={tableId}
      className={clsx(
        {
          [classes.root]: true,
          [classes.stackedParent]: options.responsive === 'vertical',
          [classes.stackedParentAlways]: options.responsive === 'verticalAlways',
          [classes.simpleCell]: options.responsive === 'simple',
          'datatables-noprint': !print,
        },
        className,
      )}
      {...otherProps}>
      {innerCells}
    </TableCell>
  );
}

export default TableBodyCell;
