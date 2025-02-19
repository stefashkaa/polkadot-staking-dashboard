// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ButtonHelp } from '@polkadotcloud/core-ui';
import { PageRowWrapper } from 'Wrappers';
import { MaxPayoutDays } from 'consts';
import { useHelp } from 'contexts/Help';
import { usePlugins } from 'contexts/Plugins';
import { useStaking } from 'contexts/Staking';
import { useSubscan } from 'contexts/Subscan';
import { useUi } from 'contexts/UI';
import { PayoutBar } from 'library/Graphs/PayoutBar';
import { PayoutLine } from 'library/Graphs/PayoutLine';
import { formatSize, sortNonZeroPayouts } from 'library/Graphs/Utils';
import {
  CardHeaderWrapper,
  CardWrapper,
  GraphWrapper,
} from 'library/Graphs/Wrappers';
import { useSize } from 'library/Hooks/useSize';
import { PageTitle } from 'library/PageTitle';
import { StatBoxList } from 'library/StatBoxList';
import { StatusLabel } from 'library/StatusLabel';
import { SubscanButton } from 'library/SubscanButton';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnySubscan } from 'types';
import type { PageProps } from '../types';
import { PayoutList } from './PayoutList';
import { LastEraPayoutStat } from './Stats/LastEraPayout';

export const Payouts = ({ page }: PageProps) => {
  const { t } = useTranslation();
  const { payouts, poolClaims, payoutsFromDate, payoutsToDate } = useSubscan();
  const { isSyncing } = useUi();
  const { plugins } = usePlugins();
  const { inSetup } = useStaking();
  const notStaking = !isSyncing && inSetup();
  const { openHelp } = useHelp();

  const [payoutsList, setPayoutLists] = useState<AnySubscan>([]);

  const { key } = page;

  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref.current);
  const { width, height, minHeight } = formatSize(size, 300);

  useEffect(() => {
    // filter zero rewards and order via block timestamp, most recent first.
    setPayoutLists(sortNonZeroPayouts(payouts, poolClaims, true));
  }, [payouts, poolClaims]);

  return (
    <>
      <PageTitle title={t(key, { ns: 'base' })} />
      <StatBoxList>
        <LastEraPayoutStat />
      </StatBoxList>
      <PageRowWrapper className="page-padding" noVerticalSpacer>
        <GraphWrapper>
          <SubscanButton />
          <CardHeaderWrapper padded>
            <h4>
              {t('payouts.payoutHistory', { ns: 'pages' })}
              <ButtonHelp
                marginLeft
                onClick={() => openHelp('Payout History')}
              />
            </h4>
            <h2>
              {payoutsFromDate && payoutsToDate ? (
                <>
                  {payoutsFromDate}
                  {payoutsToDate !== payoutsFromDate && (
                    <>&nbsp;-&nbsp;{payoutsToDate}</>
                  )}
                </>
              ) : (
                t('payouts.none', { ns: 'pages' })
              )}
            </h2>
          </CardHeaderWrapper>
          <div className="inner" ref={ref} style={{ minHeight }}>
            {!plugins.includes('subscan') ? (
              <StatusLabel
                status="active_service"
                statusFor="subscan"
                title={t('payouts.subscanDisabled', { ns: 'pages' })}
                topOffset="30%"
              />
            ) : (
              <StatusLabel
                status="sync_or_setup"
                title={t('payouts.notStaking', { ns: 'pages' })}
                topOffset="30%"
              />
            )}

            <div
              className="graph"
              style={{
                height: `${height}px`,
                width: `${width}px`,
                position: 'absolute',
                opacity: notStaking ? 0.75 : 1,
                transition: 'opacity 0.5s',
              }}
            >
              <PayoutBar days={MaxPayoutDays} height="165px" />
              <PayoutLine days={MaxPayoutDays} average={10} height="65px" />
            </div>
          </div>
        </GraphWrapper>
      </PageRowWrapper>
      {!payoutsList?.length ? (
        <></>
      ) : (
        <PageRowWrapper className="page-padding" noVerticalSpacer>
          <CardWrapper>
            <PayoutList
              title={t('payouts.recentPayouts', { ns: 'pages' })}
              payouts={payoutsList}
              pagination
            />
          </CardWrapper>
        </PageRowWrapper>
      )}
    </>
  );
};
