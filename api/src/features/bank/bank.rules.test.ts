import { describe, expect, it } from 'vitest';
import { computeAdjustedBalance, computeTransferBalances, reconcilePlayersCount } from './bank.rules.js';

describe('bank.rules', () => {
  it('aplica transferência válida', () => {
    const result = computeTransferBalances({
      fromBalance: 5000,
      toBalance: 1200,
      amount: 700
    });

    expect(result).toEqual({
      fromBalance: 4300,
      toBalance: 1900
    });
  });

  it('bloqueia transferência com saldo insuficiente', () => {
    expect(() =>
      computeTransferBalances({
        fromBalance: 300,
        toBalance: 1000,
        amount: 500
      })
    ).toThrow('Saldo insuficiente');
  });

  it('aplica ajuste de saldo para crédito e débito', () => {
    expect(computeAdjustedBalance(1000, 250)).toBe(1250);
    expect(computeAdjustedBalance(1000, -400)).toBe(600);
  });

  it('reconcilia contagem de jogadores com proteção de faixa', () => {
    expect(reconcilePlayersCount(4, 3)).toBe(4);
    expect(reconcilePlayersCount(-1, 0)).toBe(0);
    expect(reconcilePlayersCount(2, 5)).toBe(5);
  });
});
