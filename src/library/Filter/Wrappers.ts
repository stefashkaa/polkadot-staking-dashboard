// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import {
  borderPrimary,
  buttonPrimaryBackground,
  buttonSecondaryBackground,
  networkColor,
  textSecondary,
} from 'theme';

export const Wrapper = styled.div`
  padding: 0 0.5rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-wrap: nowrap;
  height: 65px;
  margin: 1rem 0;

  > .hide-scrollbar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;

    > div {
      display: flex;
      flex-wrap: nowrap;
      overflow: auto;
      width: 100%;
      padding-bottom: 3rem;

      > .category {
        display: flex;
        flex-flow: column nowrap;
        justify-content: flex-start;

        > .head {
          color: ${textSecondary};
          flex: 1;
          padding-bottom: 0.5rem;
          padding-left: 0.5rem;
          font-size: 0.9rem;
          display: flex;
          flex-flow: row wrap;
          align-items: center;

          button {
            background: ${buttonSecondaryBackground};
            color: ${textSecondary};
            font-size: 0.88rem;
            border-radius: 0.5rem;
            margin: 0 0.25rem;
            padding: 0.25rem 0.75rem;

            &:disabled {
              opacity: 0.5;
              cursor: default;
            }
          }
        }
        > .items {
          flex: 1;
          display: flex;
          flex-flow: row nowrap;
          justify-content: flex-start;

          > button {
            padding: 0 0.25rem;
          }
        }
      }
    }
  }
`;

export const ItemWrapper = styled.div<any>`
  border: 1px solid ${(props) => (props.active ? networkColor : borderPrimary)};
  border-radius: 0.7rem;
  display: flex;
  flex-flow: row nowrap;
  position: relative;
  padding: 0.65rem 0.85rem;
  margin-right: 1rem;
  align-items: center;
  width: max-content;

  &:last-child {
    margin-right: 0;
  }
  .icon {
    color: ${(props) => (props.active ? networkColor : textSecondary)};
    display: flex;
    flex-flow: column wrap;
    justify-content: center;
    align-items: center;
    margin-right: 0.75rem;
  }
  p {
    color: ${(props) => (props.active ? networkColor : textSecondary)};
    font-size: 0.9rem;
    margin: 0;
    text-align: left;
    padding-top: 0.15rem;
    line-height: 0.95rem;
  }
`;

export const LargeItemWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding: 0.5rem;
  > .inner {
    border: 1.5px solid ${borderPrimary};
    background: ${buttonPrimaryBackground};
    border-radius: 1rem;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    position: relative;
    padding: 1rem;

    &:last-child {
      margin-right: 0;
    }

    > section {
      width: 100%;
      display: flex;
      flex-flow: row wrap;
      align-items: center;

      h3 {
        margin: 0;
      }
    }

    svg {
      color: ${networkColor};
      margin-right: 0.75rem;
    }

    p {
      color: ${textSecondary};
      margin: 0;
      text-align: left;
      padding: 0.5rem 0 0 0;
    }
  }
`;

export default Wrapper;
