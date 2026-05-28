import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';
import { FLIPSTARTER_URL } from '../constants';

type Supporter = {
  name: string;
  bch: number;
  message?: string;
};

// Backers of the 2025 CashScript Flipstarter, ordered by contribution.
const supporters2025: Supporter[] = [
  { name: 'molecular', bch: 119.78, message: 'developers, developers, developeeeers!' },
  { name: 'majamalu', bch: 50.10 },
  { name: 'General Protocols', bch: 27.52, message: 'Hedge, short or long on bchbull.com — made with CashScript!' },
  { name: 'toorik', bch: 8.01 },
  { name: 'The Bitcoin Cash Podcast', bch: 5.01, message: 'CashScript is essential.' },
  { name: 'AsashoryuMaryBerry', bch: 2.02 },
  { name: 'Richard Brady', bch: 2.00, message: 'CashScript FTW!' },
  { name: 'emergent_reasons', bch: 1.51, message: 'Professionalism, good maintenance and practical progress 💯' },
  { name: 'Steve2048', bch: 1.01, message: 'Belgian Power! Congrats for all you do and good luck with Blaze!' },
  { name: 'Bernanácatl', bch: 0.65, message: 'Keep cooking liberty with passion!' },
  { name: 'im_uname', bch: 0.62, message: 'wait nobody told me this was going on' },
  { name: 'Kallisti.cash', bch: 0.51, message: 'essential!' },
  { name: 'CashDragon', bch: 0.51, message: 'RealBitcoin.Cash' },
  { name: 'minimalB', bch: 0.50 },
  { name: 'Bitcoin Out Loud', bch: 0.25, message: 'CashScript FTW!' },
];

function SupporterCard({ supporter, hideMessage }: { supporter: Supporter; hideMessage?: boolean }) {
  const { name, message } = supporter;
  return (
    <div className={styles.supporterCard}>
      <h3 className={styles.supporterName}>{name}</h3>
      {message && !hideMessage && <p className={styles.supporterMessage}>{message}</p>}
    </div>
  );
}

function Supporters(): React.ReactNode {
  return (
    <Layout
      title='Supporters'
      description='The people and organisations who funded CashScript development through the 2025 Flipstarter.'>
      <section className={styles.supporters}>
        <header className={styles.supportersHeader}>
          <h1>Supporters</h1>
          <p className={styles.supportersSubtitle}>
            CashScript development is funded by the Bitcoin Cash community. Our heartfelt thanks to everyone
            who backed the 2025 Flipstarter to support the development of CashScript.
          </p>
          <Link className={styles.supportersLink} to={FLIPSTARTER_URL}>
            View the full 2025 Flipstarter →
          </Link>
        </header>
        <div className={styles.supportersBody}>
          <div className={styles.supporterCards}>
            <div className={classnames(styles.supporterTier, styles.tierTop)}>
              {supporters2025.slice(0, 3).map((supporter) => (
                <SupporterCard key={supporter.name} supporter={supporter} />
              ))}
            </div>
            <div className={classnames(styles.supporterTier, styles.tierMid)}>
              {supporters2025.slice(3, 7).map((supporter) => (
                <SupporterCard key={supporter.name} supporter={supporter} />
              ))}
            </div>
            <div className={classnames(styles.supporterTier, styles.tierRest)}>
              {supporters2025.slice(7).map((supporter) => (
                <SupporterCard key={supporter.name} supporter={supporter} hideMessage />
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Supporters;
