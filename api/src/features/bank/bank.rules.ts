interface TransferComputationInput {
  fromBalance: number;
  toBalance: number;
  amount: number;
}

interface TransferComputationResult {
  fromBalance: number;
  toBalance: number;
}

export const computeTransferBalances = ({
  fromBalance,
  toBalance,
  amount
}: TransferComputationInput): TransferComputationResult => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Valor da transferência inválido');
  }

  if (fromBalance < amount) {
    throw new Error('Saldo insuficiente');
  }

  return {
    fromBalance: fromBalance - amount,
    toBalance: toBalance + amount
  };
};

export const computeAdjustedBalance = (currentBalance: number, amount: number) => {
  if (!Number.isFinite(amount) || amount === 0) {
    throw new Error('Valor de ajuste inválido');
  }

  return currentBalance + amount;
};

export const reconcilePlayersCount = (recordedCount: number, actualCount: number) => {
  const safeRecorded = Number.isFinite(recordedCount) ? recordedCount : 0;
  const safeActual = Number.isFinite(actualCount) ? actualCount : 0;
  return Math.max(0, Math.max(safeRecorded, safeActual));
};
