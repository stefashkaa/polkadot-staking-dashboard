// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';
import { useBalances } from 'contexts/Accounts/Balances';
import { useLedgers } from 'contexts/Accounts/Ledgers';
import { useNetworkMetrics } from 'contexts/Network';
import { usePoolMemberships } from 'contexts/Pools/PoolMemberships';
import React from 'react';
import type { MaybeAccount } from 'types';
import * as defaults from './defaults';
import type { TransferOptions, TransferOptionsContextInterface } from './types';

export const TransferOptionsContext =
  React.createContext<TransferOptionsContextInterface>(
    defaults.defaultBalancesContext
  );

export const useTransferOptions = () =>
  React.useContext(TransferOptionsContext);

export const TransferOptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { activeEra } = useNetworkMetrics();
  const { getAccount, getAccountBalance, getAccountLocks } = useBalances();
  const { getLedgerForStash } = useLedgers();
  const { membership } = usePoolMemberships();

  // get the bond and unbond amounts available to the user
  const getTransferOptions = (address: MaybeAccount): TransferOptions => {
    const account = getAccount(address);
    if (account === null) {
      return defaults.transferOptions;
    }
    const balance = getAccountBalance(address);
    const ledger = getLedgerForStash(address);
    const locks = getAccountLocks(address);

    const { freeAfterReserve } = balance;
    const { active, total, unlocking } = ledger;

    // calculate total balance locked
    const maxLockBalance =
      locks.reduce(
        (prev, current) => {
          return prev.amount.isGreaterThan(current.amount) ? prev : current;
        },
        { amount: new BigNumber(0) }
      )?.amount || new BigNumber(0);

    const points = membership?.points;
    const activePool = points ? new BigNumber(points) : new BigNumber(0);

    // total amount actively unlocking
    let totalUnlocking = new BigNumber(0);
    let totalUnlocked = new BigNumber(0);
    for (const u of unlocking) {
      const { value, era } = u;
      if (activeEra.index.isGreaterThan(era)) {
        totalUnlocked = totalUnlocked.plus(value);
      } else {
        totalUnlocking = totalUnlocking.plus(value);
      }
    }

    // free balance after reserve. Does not consider locks other than staking.
    const freeBalance = BigNumber.max(freeAfterReserve.minus(total), 0);

    const nominateOptions = () => {
      // total possible balance that can be bonded
      const totalPossibleBond = BigNumber.max(
        freeAfterReserve.minus(totalUnlocking).minus(totalUnlocked),
        0
      );

      // total additional balance that can be bonded.
      const totalAdditionalBond = totalPossibleBond.minus(active);

      return {
        active,
        totalUnlocking,
        totalUnlocked,
        totalPossibleBond,
        totalAdditionalBond,
        totalUnlockChuncks: unlocking.length,
      };
    };

    const poolOptions = () => {
      const unlockingPool = membership?.unlocking || [];

      // total possible balance that can be bonded
      const totalPossibleBondPool = BigNumber.max(
        freeAfterReserve.minus(maxLockBalance),
        new BigNumber(0)
      );

      // total additional balance that can be bonded.
      const totalAdditionalBondPool = totalPossibleBondPool;

      let totalUnlockingPool = new BigNumber(0);
      let totalUnlockedPool = new BigNumber(0);
      for (const u of unlockingPool) {
        const { value, era } = u;
        if (activeEra.index.isGreaterThan(era)) {
          totalUnlockedPool = totalUnlockedPool.plus(value);
        } else {
          totalUnlockingPool = totalUnlockingPool.plus(value);
        }
      }
      return {
        active: activePool,
        totalUnlocking: totalUnlockingPool,
        totalUnlocked: totalUnlockedPool,
        totalPossibleBond: totalPossibleBondPool,
        totalAdditionalBond: totalAdditionalBondPool,
        totalUnlockChuncks: unlockingPool.length,
      };
    };

    return {
      freeBalance,
      nominate: nominateOptions(),
      pool: poolOptions(),
    };
  };

  return (
    <TransferOptionsContext.Provider
      value={{
        getTransferOptions,
      }}
    >
      {children}
    </TransferOptionsContext.Provider>
  );
};
