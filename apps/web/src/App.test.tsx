import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('increases the count when the button is clicked', () => {
    render(<App />);

    const button = screen.getByRole('button', { name: 'Count is 0' });
    fireEvent.click(button);

    expect(button.textContent).toBe('Count is 1');
  });
});
