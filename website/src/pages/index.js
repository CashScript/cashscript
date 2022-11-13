import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

const features = [
  {
    title: 'Efficient and Reliable Verification',
    description: (
      <>
        <p>
          Smart contracts on Bitcoin Cash are stateless and UTXO-based. This
          model allows transactions to be verified independently and efficiently.
          Because there is no state that can impact the execution of these smart
          contracts, the results are deterministic and predictable.
        </p>
      </>
    ),
  },
  {
    title: 'Private and Isolated Contracts',
    description: (
      <>
        <p>
          Because of Bitcoin Cash' UTXO-based model, each contract is fully
          independent and isolated from each other. This limits systemic risk
          and makes contract upgrades much simpler. Furthermore, Bitcoin Cash
          contracts use P2SH, preserving the privacy of participants.
        </p>
      </>
    ),
  },
  {
    title: 'Strong Abstraction',
    description: (
      <>
        <p>
          Bitcoin Cash transactions run on a virtual machine called Bitcoin Script.
          Writing bytecode for this virtual machine is difficult and error-prone.
          CashScript offers a strong abstraction for writing Bitcoin Cash smart
          contracts, improving developer experience and reliability of contracts.
        </p>
      </>
    ),
  },
  {
    title: 'DeFi on Bitcoin Cash',
    description: (
      <>
        <p>
          Most DeFi applications are currently running on top of Ethereum. Bitcoin
          Cash contracts use a different and functionally more limited paradigm.
          But with techniques such as covenants, keeping local state in NFTs and 
          trust-minimised price oracles, DeFi is very much possible on Bitcoin Cash.
        </p>
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--6', styles.feature)}>
      {imgUrl && (
        <div className='text--center'>
          <img className={classnames('padding-vert--md', styles.featureImage)} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}: ${siteConfig.tagline}`}
      description='A high-level smart contract language for Bitcoin Cash. Write complex smart contracts with a straightforward syntax and integrate them into your JavaScript applications.'
      keywords={['cashscript','smart contracts','bitcoin cash', 'compiler', 'sdk', 'programming language']}>
      <header className={classnames('hero', styles.banner)}>
        <div className='container'>
          <div className='row'>
            <div className={classnames('col col--6 col--offset-3')}>
              <h1>{siteConfig.title}</h1>
              <h2>{siteConfig.tagline}</h2>
              <div className={styles.buttons}>
                <Link
                  className={classnames(
                    'button button--primary button--lg',
                    styles.getStarted,
                  )}
                  to={useBaseUrl('docs/basics/getting-started')}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main>
        {features && features.length && (
          <section className={styles.features}>
            <div className='container margin-vert--md'>
              <div className='row'>
                {features.map((props, idx) => (<Feature key={idx} {...props} />))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
