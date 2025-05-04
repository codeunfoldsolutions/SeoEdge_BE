import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { Model } from 'mongoose';
import { ISeo, ISeoDocument, SeoModel } from '../../models/seo.model';
import logger from '../../config/logger';

class SeoService {
  private static instance: SeoService;
  private seoModel: Model<ISeoDocument>;

  private constructor() {
    this.seoModel = SeoModel;
  }

  public static getInstance(): SeoService {
    if (!SeoService.instance) {
      SeoService.instance = new SeoService();
    }
    return SeoService.instance;
  }

  async createNewSeoEntry(data: ISeo) {
    try {
      const seoEntry = await this.seoModel.create(data);
      return { data: seoEntry };
    } catch (error) {
      logger.error(`Error creating new SEO entry: ${error}`);
      return { error: 'Failed to create SEO entry' };
    }
  }
  async getSeoEntries(ownerId: string) {
    try {
      const seoEntries = await this.seoModel.find({ ownerId });
      return { data: seoEntries };
    } catch (error) {
      logger.error(`Error fetching SEO entries: ${error}`);
      throw new Error('Failed to fetch SEO entries');
    }
  }
  async checkIfProjectExists(ownerId: string, url: string) {
    try {
      const project = await this.seoModel.findOne({ ownerId, url });
      return { data: project ? [project] : [] };
    } catch (error) {
      logger.error(`Error checking project existence: ${error}`);
      throw new Error('Failed to check project existence');
    }
  }
  async lightHouseGenerateReport(url: string) {
    try {
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

      function firstSentence(text: string): string {
        const match = text.match(/^[^.]*\./);
        return match ? match[0] : text;
      }

      return {
        categories: {
          performance: categories.performance.score ?? 0,
          accessibility: categories.accessibility.score ?? 0,
          seo: categories.seo.score ?? 0,
          bestPractices: categories['best-practices'].score ?? 0,
        },
        audits: {
          'is-on-https': {
            score: audits['is-on-https'].score ?? 0,
            description: firstSentence(audits['is-on-https'].description ?? ''),
          },
          'redirects-http': {
            score: audits['redirects-http'].score ?? 0,
            description: firstSentence(
              audits['redirects-http'].description ?? ''
            ),
          },
          viewport: {
            score: audits.viewport.score ?? 0,
            description: firstSentence(audits.viewport.description ?? ''),
          },
          'first-contentful-paint': {
            score: audits['first-contentful-paint'].score ?? 0,
            displayValue: audits['first-contentful-paint'].displayValue ?? '',
            description: firstSentence(
              audits['first-contentful-paint'].description ?? ''
            ),
          },
          'first-meaningful-paint': {
            score: audits['first-meaningful-paint'].score ?? 0,
            description: firstSentence(
              audits['first-meaningful-paint'].description ?? ''
            ),
          },
          speedIndex: {
            score: audits['speed-index'].score ?? 0,
            displayValue: audits['speed-index'].displayValue ?? '',
            description: firstSentence(audits['speed-index'].description ?? ''),
          },
          'errors-in-console': {
            score: audits['errors-in-console'].score ?? 0,
            description: firstSentence(
              audits['errors-in-console'].description ?? ''
            ),
          },
          interactive: {
            score: audits.interactive.score ?? 0,
            displayValue: audits.interactive.displayValue ?? '',
            description: firstSentence(audits.interactive.description ?? ''),
          },
          'bootup-time': {
            score: audits['bootup-time'].score ?? 0,
            displayValue: audits['bootup-time'].displayValue ?? '',
            description: firstSentence(audits['bootup-time'].description ?? ''),
          },
        },
      };
    } catch (error) {
      logger.error(`Error generating Lighthouse report: ${error}`);
      return { error: 'Failed to generate Lighthouse report' };
    }
  }
}

export default SeoService;
