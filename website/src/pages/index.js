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
        Smart contracts on Bitcoin Cash are UTXO-based with local state. This
        model allows transactions to be verified independently and efficiently.
        Because there is no global state that can impact the execution of these smart
        contracts, the results are deterministic and predictable.
      </>
    ),
  },
  {
    title: 'Strong Abstraction',
    description: (
      <>
        Bitcoin Cash transactions run on a virtual machine called 'BCH Script'.
        Writing bytecode for this virtual machine is difficult and error-prone.
        CashScript offers a strong abstraction for writing Bitcoin Cash smart
        contracts, improving developer experience and reliability of contracts.
      </>
    ),
  },
  {
    title: 'DeFi on Bitcoin Cash',
    description: (
      <>
        Bitcoin Cash has had many script upgrades, such as CashTokens and transaction introspection.
        Because of this, DeFi is very much possible on Bitcoin Cash.
        However, compared to EVM, smart contracts work very differently due to BCH's UTXO
        architecture.
      </>
    ),
  },
  {
    title: 'Integrated Tooling',
    description: (
      <>
        CashScript offers integrated tooling through the JavaScript SDK.
        The SDK has utilities for easy transaction building and other network functionality.
        CashScript has built-in debug tooling compatible with the Bitauth-IDE to offer the best developer experience.  
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
