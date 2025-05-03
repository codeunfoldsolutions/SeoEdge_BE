import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

export interface LighthouseResults {
  performance?: number;
  accessibility?: number;
  seo?: number;
  bestPractices?: number;
  pwa?: number;
  requestedUrl?: string;
  fetchTime?: string;
  fullResult?: any;
}

export default async function runLighthouse(url: string): Promise<any> {
  // 1) Launch headless Chrome
  const chrome = await launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info' as const,
    port: chrome.port,
    output: 'json' as const,
  };

  // 2) Run Lighthouse audit
  const runnerResult = await lighthouse(url, options);

  // 3) Kill Chrome
  await chrome.kill();

  // 4) Extract relevant categories
  if (!runnerResult || !runnerResult.lhr) {
    throw new Error('Lighthouse audit failed');
  }
  const { categories, audits, fetchTime, requestedUrl } = runnerResult.lhr;

  // return {
  //   // 1) category scores
  //   performance: categories.performance.score ?? 0,
  //   accessibility: categories.accessibility.score ?? 0,
  //   seo: categories.seo.score ?? 0,
  //   bestPractices: categories['best-practices'].score ?? 0,

  //   // 2) PWA / HTTPS checks
  //   'is-on-https': audits['is-on-https'].score ?? 0, // :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
  //   'redirects-http': audits['redirects-http'].score ?? 0, // :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
  //   viewport: audits.viewport.score ?? 0, // :contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5}
  //   doctype: audits.doctype.score ?? 0, // :contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7}
  //   charset: audits.charset.score ?? 0, // :contentReference[oaicite:8]{index=8}:contentReference[oaicite:9]{index=9}

  //   // 3) paint & vitals
  //   'first-contentful-paint-score': audits['first-contentful-paint'].score ?? 0, // :contentReference[oaicite:10]{index=10}:contentReference[oaicite:11]{index=11}
  //   'first-contentful-paint-time':
  //     audits['first-contentful-paint'].displayValue ?? '', // :contentReference[oaicite:12]{index=12}:contentReference[oaicite:13]{index=13}
  //   'largest-contentful-paint-score':
  //     audits['largest-contentful-paint'].score ?? 0, // :contentReference[oaicite:14]{index=14}:contentReference[oaicite:15]{index=15}
  //   'largest-contentful-paint-time':
  //     audits['largest-contentful-paint'].displayValue ?? '', // :contentReference[oaicite:16]{index=16}:contentReference[oaicite:17]{index=17}
  //   'first-meaningful-paint': audits['first-meaningful-paint'].score ?? 0, // :contentReference[oaicite:18]{index=18}:contentReference[oaicite:19]{index=19}

  //   'speed-index': {
  //     score: audits['speed-index'].score ?? 0, // :contentReference[oaicite:20]{index=20}:contentReference[oaicite:21]{index=21}
  //     time: audits['speed-index'].displayValue ?? '', // :contentReference[oaicite:22]{index=22}:contentReference[oaicite:23]{index=23}
  //   },

  //   'total-blocking-time': {
  //     score: audits['total-blocking-time'].score ?? 0, // :contentReference[oaicite:24]{index=24}:contentReference[oaicite:25]{index=25}
  //     time: audits['total-blocking-time'].displayValue ?? '', // :contentReference[oaicite:26]{index=26}:contentReference[oaicite:27]{index=27}
  //   },

  //   'max-potential-fid': {
  //     score: audits['max-potential-fid'].score ?? 0, // :contentReference[oaicite:28]{index=28}:contentReference[oaicite:29]{index=29}
  //     time: audits['max-potential-fid'].displayValue ?? '', // :contentReference[oaicite:30]{index=30}:contentReference[oaicite:31]{index=31}
  //   },

  //   'cumulative-layout-shift-score':
  //     audits['cumulative-layout-shift'].score ?? 0, // :contentReference[oaicite:32]{index=32}:contentReference[oaicite:33]{index=33}
  //   'cumulative-layout-shift-value':
  //     audits['cumulative-layout-shift'].displayValue ?? '', // :contentReference[oaicite:34]{index=34}:contentReference[oaicite:35]{index=35}

  //   'server-response-time': {
  //     score: audits['server-response-time'].score ?? 0, // :contentReference[oaicite:36]{index=36}:contentReference[oaicite:37]{index=37}
  //     time: audits['server-response-time'].displayValue ?? '', // :contentReference[oaicite:38]{index=38}:contentReference[oaicite:39]{index=39}
  //   },

  //   // 4) best-practices extras
  //   'uses-passive-event-listeners':
  //     audits['uses-passive-event-listeners'].score ?? 0, // :contentReference[oaicite:40]{index=40}:contentReference[oaicite:41]{index=41}
  //   'no-document-write': audits['no-document-write'].score ?? 0, // :contentReference[oaicite:42]{index=42}:contentReference[oaicite:43]{index=43}
  //   'meta-description': audits['meta-description'].score ?? 0, // :contentReference[oaicite:44]{index=44}:contentReference[oaicite:45]{index=45}
  //   'http-status-code': audits['http-status-code'].score ?? 0, // :contentReference[oaicite:46]{index=46}:contentReference[oaicite:47]{index=47}
  //   'font-size': audits['font-size'].score ?? 0, // :contentReference[oaicite:48]{index=48}:contentReference[oaicite:49]{index=49}

  //   // 5) DOM & resources
  //   'dom-size': audits['dom-size'].numericValue ?? 0, // :contentReference[oaicite:50]{index=50}:contentReference[oaicite:51]{index=51}
  //   'dom-size-elements': audits['dom-size'].displayValue ?? '', // :contentReference[oaicite:52]{index=52}:contentReference[oaicite:53]{index=53}
  //   'total-byte-weight': audits['total-byte-weight']?.numericValue ?? 0, // :contentReference[oaicite:54]{index=54}:contentReference[oaicite:55]{index=55}
  //   'total-byte-weight-bytes': audits['total-byte-weight']?.displayValue ?? '', // :contentReference[oaicite:56]{index=56}:contentReference[oaicite:57]{index=57}

  //   // 6) JavaScript libs detected
  //   // 'js-libraries':                    audits['js-libraries'].details.items.map(lib => lib.name).join(', ') ?? '',  // :contentReference[oaicite:58]{index=58}:contentReference[oaicite:59]{index=59}

  //   // 7) metadata
  //   totalFetchTime: fetchTime, // timestamp string
  //   requestedUrl, // the URL Lighthouse audited
  // };

  return {
    categories,
    audits,
    fetchTime,
    requestedUrl,
    // // 1) category scores (0–1 → multiply by 100 if you prefer %)
    performance: categories.performance.score ?? 0,
    accessibility: categories.accessibility.score ?? 0,
    seo: categories.seo.score ?? 0,
    bestPractices: categories['best-practices'].score ?? 0,
    'is-on-https': audits['is-on-https'].score ?? 0,
    'redirects-http': audits['redirects-http'].score ?? 0,
    'first-contentful-paint-score': audits['first-contentful-paint'].score ?? 0,
    'first-contentful-paint-time':
      audits['first-contentful-paint'].displayValue ?? 0,
    'first-meaningful-paint': audits['first-meaningful-paint'].score ?? 0,
    'speed-index': {
      score: audits['speed-index'].score ?? 0,
      time: audits['speed-index'].displayValue ?? 0,
    },
    'total-blocking-time': {
      score: audits['total-blocking-time'].score ?? 0,
      time: audits['total-blocking-time'].displayValue ?? 0,
    },
    'max-potential-fid': {
      score: audits['max-potential-fid'].score ?? 0,
      time: audits['max-potential-fid'].displayValue ?? 0,
    },
    'server-response-time': {
      score: audits['server-response-time'].score ?? 0,
      time: audits['server-response-time'].displayValue ?? 0,
    },
    viewport: audits.viewport.score ?? 0,
    // pwa: categories.pwa.score ?? 0,

    // // 2) numeric audit values
    // firstContentfulPaint: audits['first-contentful-paint'].numericValue,
    // largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
    // speedIndex: audits['speed-index'].numericValue,

    // 3) metadata
    // totalFetchTime: fetchTime,
    // requestedUrl,
  };
}
// const categories = runnerResult.lhr.categories;
// return {
//   // performance: categories.performance.score ?? 0,
//   // accessibility: categories.accessibility.score ?? 0,
//   // seo: categories.seo.score ?? 0,
//   // bestPractices: categories['best-practices'].score ?? 0,
//   // pwa: categories.pwa.score ?? 0,
//   // requestedUrl: runnerResult.lhr.requestedUrl ?? '',
//   fetchTime: runnerResult.lhr.fetchTime,
//   fullResult: runnerResult.lhr,
// };
