import React from 'react';
import { getColModel, reorderColumns, handleHover } from '../src/hooks/useColumnDrop';

describe('useColumnDrop', function () {
  beforeAll(() => {});

  it('should reorder columns when reorderColumns is called', () => {
    let prevColumnOrder = [1, 2, 3, 4];
    let newOrder = reorderColumns(prevColumnOrder, 1, 4);

    expect(newOrder).toEqual([2, 3, 4, 1]);
  });

  it('should build a column model object when getColModel is called', () => {
    let offsetParent = {
      offsetLeft: 10,
      offsetParent: null,
    };
    let headCellRefs = {
      0: {
        offsetLeft: 0,
        offsetParent: offsetParent,
        offsetWidth: 0,
      },
      1: {
        offsetLeft: 0,
        offsetParent: null,
        offsetWidth: 0,
      },
      2: {
        offsetLeft: 0,
        offsetParent: null,
        offsetWidth: 0,
      },
    };
    let columnOrder = [0, 1];
    let columns = [
      {
        display: 'true',
      },
      {
        display: 'true',
      },
    ];

    let newModel = getColModel(headCellRefs, columnOrder, columns);

    expect(newModel.length).toBe(3);
    expect(newModel[0].left).toBe(10);
    expect(newModel[0].ref.offsetParent).toBe(offsetParent);
    expect(newModel[1].columnIndex).toBe(0);
  });

  it('should build a column model object when getColModel is called and no select cell exists', () => {
    let headCellRefs = {
      0: null,
      1: {
        offsetLeft: 0,
        offsetParent: null,
        offsetWidth: 0,
      },
      2: {
        offsetLeft: 0,
        offsetParent: null,
        offsetWidth: 0,
      },
    };
    let columnOrder = [0, 1];
    let columns = [
      {
        display: 'true',
      },
      {
        display: 'true',
      },
    ];

    let newModel = getColModel(headCellRefs, columnOrder, columns);

    expect(newModel.length).toBe(2);
    expect(newModel[0].left).toBe(0);
    expect(newModel[1].columnIndex).toBe(1);
  });

  it('should set columnShift on timers when handleHover is called', () => {
    let offsetParent = {
      offsetLeft: 10,
      offsetParent: null,
    };
    let headCellRefs = {
      0: {
        offsetLeft: 0,
        offsetParent: offsetParent,
        offsetWidth: 0,
        style: {},
      },
      1: {
        offsetLeft: 0,
        offsetParent: null,
        offsetWidth: 10,
        style: {},
      },
      2: {
        offsetLeft: 0,
        offsetParent: null,
        offsetWidth: 10,
        style: {},
      },
    };
    let columnOrder = [0, 1];
    let columns = [
      {
        display: 'true',
      },
      {
        display: 'true',
      },
    ];
    let timers = {
      columnShift: null,
    };

    handleHover({
      item: {
        columnIndex: 0,
        left: 0,
        style: {},
      },
      mon: {
        getItem: () => ({
          colIndex: 1,
          headCellRefs: headCellRefs,
        }),
        getClientOffset: () => ({
          x: 15,
        }),
      },
      index: 0,
      headCellRefs,
      updateColumnOrder: jest.fn(),
      columnOrder: [0, 1],
      transitionTime: 0,
      tableRef: {
        querySelectorAll: () => [
          {
            style: {},
          },
        ],
      },
      tableId: '123',
      timers,
      columns,
    });

    expect(timers.columnShift).not.toBe(null);
  });
});
