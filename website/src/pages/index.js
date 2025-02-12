import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

const features = [
  {
    title: 'TypeScript SDK',
    description: (
      <>
        The CashScript TypeScript SDK makes it easy to build smart contract transactions, both in browser or on the server.
        By offering full type-safety, developers can be confident in the quality and reliability of their applications.
      </>
    ),
  },
  {
    title: 'Familiar Syntax',
    description: (
      <>
        The CashScript syntax is based on Ethereum's smart contract language Solidity,
        which in turn is influenced by C++, Python, and JavaScript. This should make writing
        CashScript contracts feel familiar even to new developers.
      </>
    ),
  },
  {
    title: 'Integrated Network APIs',
    description: (
      <>
        To make it easy to get blockchain information, the CashScript SDK exports a standardized network provider to query network APIs.
        The primary class of network providers are the electrum servers but other network providers are also supported.
      </>
    ),
  },
  {
    title: 'Advanced Debug Tooling',
    description: (
      <>
        To offer the best developer experience for debugging and automated testing easy for developers,
        CashScript has extensive debug tooling built-in.
        This makes it possible to develop robust contract testing suites, and to debug your contracts with the Bitauth-IDE.
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
              <div className={styles.buttons} style={{ gap: '1rem' }}>
                <Link
                  className={classnames(
                    'button button--primary button--lg',
                    styles.getStarted,
                  )}
                  to={useBaseUrl('docs/basics/about')}>
                  Learn More
                </Link>
                <Link
                  className={classnames(
                    'button button--secondary button--lg',
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
