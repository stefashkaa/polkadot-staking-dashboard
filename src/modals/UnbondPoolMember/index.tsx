// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { useModal } from 'contexts/Modal';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { planckBnToUnit, rmCommas, unitToPlanckBn } from 'Utils';
import {
  HeadingWrapper,
  NotesWrapper,
  PaddingWrapper,
  Separator,
  FooterWrapper,
} from 'modals/Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleUp, faMinus } from '@fortawesome/free-solid-svg-icons';
import { Warning } from 'library/Form/Warning';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ContentWrapper } from 'modals/UpdateBond/Wrappers';
import BN from 'bn.js';
import { usePoolMembers } from 'contexts/Pools/PoolMembers';

export const UnbondPoolMember = () => {
  const { api, network, consts } = useApi();
  const { getPoolMember } = usePoolMembers();
  const { setStatus: setModalStatus, setResize, config } = useModal();
  const { activeAccount, accountHasSigner } = useConnect();
  const { units } = network;
  const { bondDuration } = consts;

  const { who } = config;
  const member = getPoolMember(who);
  const { points } = member;
  const freeToUnbond = planckBnToUnit(new BN(rmCommas(points)), units);

  // local bond value
  const [bond, setBond] = useState({
    bond: freeToUnbond,
  });

  // bond valid
  const [bondValid, setBondValid] = useState(false);

  // unbond all validation
  const isValid = (() => {
    return freeToUnbond > 0;
  })();

  // update bond value on task change
  useEffect(() => {
    const _bond = freeToUnbond;
    setBond({ bond: _bond });
    setBondValid(isValid);
  }, [freeToUnbond, isValid]);

  // modal resize on form update
  useEffect(() => {
    setResize();
  }, [bond]);

  // tx to submit
  const tx = () => {
    let _tx = null;
    if (!bondValid || !api || !activeAccount) {
      return _tx;
    }
    // remove decimal errors
    const bondToSubmit = unitToPlanckBn(bond.bond, units);

    // determine _tx
    _tx = api.tx.nominationPools.unbond(who, bondToSubmit);
    return _tx;
  };

  const { submitTx, estimatedFee, submitting } = useSubmitExtrinsic({
    tx: tx(),
    from: activeAccount,
    shouldSubmit: bondValid,
    callbackSubmit: () => {
      setModalStatus(0);
    },
    callbackInBlock: () => {},
  });

  const TxFee = (
    <p>Estimated Tx Fee: {estimatedFee === null ? '...' : `${estimatedFee}`}</p>
  );

  return (
    <>
      <PaddingWrapper verticalOnly>
        <HeadingWrapper>
          <FontAwesomeIcon transform="grow-2" icon={faMinus} />
          Unbond Member Funds
        </HeadingWrapper>
      </PaddingWrapper>
      <ContentWrapper>
        {!accountHasSigner(activeAccount) && (
          <Warning text="Your account is read only, and cannot sign transactions." />
        )}
        <div className="items">
          <h4>Amount to unbond:</h4>
          <h2>
            {freeToUnbond} {network.unit}
          </h2>
          <Separator />
          <NotesWrapper>
            <p>
              Once unbonding, your funds to become available after{' '}
              {bondDuration} eras.
            </p>
            {bondValid && TxFee}
          </NotesWrapper>
        </div>
        <FooterWrapper>
          <div>
            <button
              type="button"
              className="submit"
              onClick={() => submitTx()}
              disabled={
                submitting || !bondValid || !accountHasSigner(activeAccount)
              }
            >
              <FontAwesomeIcon
                transform="grow-2"
                icon={faArrowAltCircleUp as IconProp}
              />
              Submit
              {submitting && 'ting'}
            </button>
          </div>
        </FooterWrapper>
      </ContentWrapper>
    </>
  );
};
