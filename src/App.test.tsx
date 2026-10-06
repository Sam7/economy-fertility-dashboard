import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { decodeAppState } from './model';

describe('scenario controls', () => {
  it('edits each GDP side independently and resets every assumption for one scenario', () => {
    render(<App />);
    fireEvent.click(screen.getByText('More assumptions'));

    const marketInputs = screen.getAllByRole('spinbutton', { name: 'Market GDP · United States dollars (USD), trillions' });
    const pppInputs = screen.getAllByRole('spinbutton', { name: 'GDP at purchasing power parity (PPP), international dollars, trillions' });
    expect(marketInputs).toHaveLength(2);
    expect(pppInputs).toHaveLength(2);

    fireEvent.change(marketInputs[0], { target: { value: '2.5' } });
    fireEvent.blur(marketInputs[0]);
    fireEvent.change(pppInputs[0], { target: { value: '3.75' } });
    fireEvent.blur(pppInputs[0]);

    expect(marketInputs[0]).toHaveValue(2.5);
    expect(marketInputs[1]).toHaveValue(1);
    expect(pppInputs[0]).toHaveValue(3.75);
    expect(pppInputs[1]).toHaveValue(1);
    expect(decodeAppState(window.location.hash)?.a.gdpMarketTrillions).toBe(2.5);

    const populationInputs = screen.getAllByRole('spinbutton', { name: 'Starting population (millions)' });
    fireEvent.change(populationInputs[0], { target: { value: '20' } });
    fireEvent.blur(populationInputs[0]);
    expect(marketInputs[0]).toHaveValue(2.5);
    expect(pppInputs[0]).toHaveValue(3.75);

    fireEvent.change(screen.getByLabelText('Scenario A country'), { target: { value: 'japan' } });
    const resetButton = screen.getByRole('button', { name: 'Reset Scenario A to Japan defaults' });
    expect(marketInputs[0]).toHaveValue(4.44);
    expect(pppInputs[0]).toHaveValue(6.8372);
    expect(populationInputs[0]).toHaveValue(122.65);
    fireEvent.change(marketInputs[0], { target: { value: '9' } });
    fireEvent.blur(marketInputs[0]);
    const retirementInputs = screen.getAllByRole('spinbutton', { name: 'Retirement age' });
    fireEvent.change(retirementInputs[0], { target: { value: '100' } });
    fireEvent.blur(retirementInputs[0]);
    expect(retirementInputs[0]).toHaveValue(100);
    fireEvent.click(resetButton);

    expect(marketInputs[0]).toHaveValue(4.44);
    expect(pppInputs[0]).toHaveValue(6.8372);
    expect(marketInputs[1]).toHaveValue(1);
    expect(pppInputs[1]).toHaveValue(1);
    expect(populationInputs[0]).toHaveValue(122.65);
    expect(retirementInputs[0]).toHaveValue(65);
  });

  it('swaps both scenarios and leaves the assumptions associated with the scenario data', () => {
    render(<App />);
    fireEvent.click(screen.getByText('More assumptions'));
    const marketInputs = screen.getAllByRole('spinbutton', { name: 'Market GDP · United States dollars (USD), trillions' });
    fireEvent.change(marketInputs[0], { target: { value: '2.2' } });
    fireEvent.blur(marketInputs[0]);
    fireEvent.change(marketInputs[1], { target: { value: '4.4' } });
    fireEvent.blur(marketInputs[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Swap scenarios' }));

    expect(marketInputs[0]).toHaveValue(4.4);
    expect(marketInputs[1]).toHaveValue(2.2);
    const state = decodeAppState(window.location.hash);
    expect(state?.a.gdpMarketTrillions).toBe(4.4);
    expect(state?.b.gdpMarketTrillions).toBe(2.2);

    fireEvent.click(screen.getByRole('button', { name: 'Copy Scenario A to B' }));
    expect(marketInputs[0]).toHaveValue(4.4);
    expect(marketInputs[1]).toHaveValue(4.4);
    expect(decodeAppState(window.location.hash)?.b.gdpMarketTrillions).toBe(4.4);
  });
});
