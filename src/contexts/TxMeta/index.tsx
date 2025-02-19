// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { setStateWithRef } from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import { useTransferOptions } from 'contexts/TransferOptions';
import React, { useEffect, useState } from 'react';
import type { AnyJson, MaybeAccount } from 'types';
import * as defaults from './defaults';
import type { TxMetaContextInterface } from './types';

export const TxMetaContext = React.createContext<TxMetaContextInterface>(
  defaults.defaultTxMeta
);

export const useTxMeta = () => React.useContext(TxMetaContext);

export const TxMetaProvider = ({ children }: { children: React.ReactNode }) => {
  const { getTransferOptions } = useTransferOptions();

  // Store the transaction fees for the transaction.
  const [txFees, setTxFees] = useState(new BigNumber(0));

  // Store the sender of the transaction.
  const [sender, setSender] = useState<MaybeAccount>(null);

  // Store whether the sender does not have enough funds.
  const [notEnoughFunds, setNotEnoughFunds] = useState(false);

  // Store the payloads of transactions if extrinsics require manual signing (e.g. Ledger). payloads
  // are calculated asynchronously and extrinsic associated with them may be cancelled. For this
  // reason we give every payload a uid, and check whether this uid matches the active extrinsic
  // before submitting it.
  const [txPayload, setTxPayloadState] = useState<{
    payload: AnyJson;
    uid: number;
  } | null>(null);
  const txPayloadRef = React.useRef(txPayload);

  // Store an optional signed transaction if extrinsics require manual signing (e.g. Ledger).
  const [txSignature, setTxSignatureState] = useState<AnyJson>(null);
  const txSignatureRef = React.useRef(txSignature);

  useEffect(() => {
    const { freeBalance } = getTransferOptions(sender);
    setNotEnoughFunds(freeBalance.minus(txFees).isLessThan(0));
  }, [txFees, sender]);

  const resetTxFees = () => {
    setTxFees(new BigNumber(0));
  };

  const getPayloadUid = () => {
    return txPayloadRef.current?.uid || 1;
  };

  const incrementPayloadUid = () => {
    return (txPayloadRef.current?.uid || 0) + 1;
  };

  const getTxPayload = () => {
    return txPayloadRef.current?.payload || null;
  };

  const setTxPayload = (p: AnyJson, uid: number) => {
    setStateWithRef(
      {
        payload: p,
        uid,
      },
      setTxPayloadState,
      txPayloadRef
    );
  };

  const resetTxPayloads = () => {
    setStateWithRef(null, setTxPayloadState, txPayloadRef);
  };

  const getTxSignature = () => {
    return txSignatureRef.current;
  };

  const setTxSignature = (s: AnyJson) => {
    setStateWithRef(s, setTxSignatureState, txSignatureRef);
  };

  const txFeesValid = (() => {
    if (txFees.isZero() || notEnoughFunds) {
      return false;
    }
    return true;
  })();

  return (
    <TxMetaContext.Provider
      value={{
        txFees,
        notEnoughFunds,
        setTxFees,
        resetTxFees,
        txFeesValid,
        sender,
        setSender,
        incrementPayloadUid,
        getPayloadUid,
        getTxPayload,
        setTxPayload,
        resetTxPayloads,
        getTxSignature,
        setTxSignature,
      }}
    >
      {children}
    </TxMetaContext.Provider>
  );
};
