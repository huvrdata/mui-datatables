import React from 'react';
import { render } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export function renderWithDnd(ui, options = {}) {
  return render(<DndProvider backend={HTML5Backend}>{ui}</DndProvider>, options);
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
