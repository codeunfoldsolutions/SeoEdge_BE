import { launch } from 'chrome-launcher';
import { Response } from 'express';
import lighthouse from 'lighthouse';
import mongoose, { Model, mongo } from 'mongoose';
import { ISeo, ISeoDocument, SeoModel } from '../../models/seo.model';
import logger from '../../config/logger';
import PDFDocument from 'pdfkit';
import {
  lighthousePDFResponse,
  CategoryEntry,
  AuditEntry,
} from '../../types/seo';

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
  async checkIfProjectExists(
    ownerId: string,
    url: {
      $regex: string;
      $options: string;
    }
  ) {
    try {
      const project = await this.seoModel.findOne({ ownerId, url });
      return { data: project ? [project] : [] };
    } catch (error) {
      logger.error(`Error checking project existence: ${error}`);
      throw new Error('Failed to check project existence');
    }
  }
  async findProjectById(id: string) {
    try {
      const project = await this.seoModel.findById(id);
      return { data: project ? [project] : [] };
    } catch (error) {
      logger.error(`Error checking project existence: ${error}`);
      throw new Error('Failed to check project existence');
    }
  }
  async findProjects(id: string) {
    try {
      const project = await this.seoModel
        .find({ ownerId: id })
        .select('-categories -audits');
      return { data: project ? [project] : [] };
    } catch (error) {
      logger.error(`Error checking project existence: ${error}`);
      throw new Error('Failed to check project existence');
    }
  }
  async lightHouseGenerateDashReport(url: string) {
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
      // Build your audits payload
      const processedAudits = {
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
      };

      // Count critical issues (score < 0.5 or score == 0)
      const criticalCount = Object.values(processedAudits).reduce(
        (count, a) => {
          return count + (a.score === null || a.score < 0.5 ? 1 : 0);
        },
        0
      );

      return {
        categories: {
          performance: categories.performance.score ?? 0,
          accessibility: categories.accessibility.score ?? 0,
          seo: categories.seo.score ?? 0,
          bestPractices: categories['best-practices'].score ?? 0,
        },
        audits: processedAudits,
        criticalCount,
      };
    } catch (error: any) {
      logger.error(`Error generating Lighthouse report: ${error}`);
      return { error: 'Failed to generate Lighthouse report' };
    }
  }

  async lightHouseGeneratePDFReport(url: string) {
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

      return {
        categories,
        audits,
      };
    } catch (error: any) {
      logger.error(`Error generating Lighthouse report: ${error}`);
      return { error: 'Failed to generate Lighthouse report' };
    }
  }

  async createPdfReport(report: lighthousePDFResponse, res: Response) {
    const { audits, categories } = report;

    try {
      // Classify audits dynamically
      const critical: Record<string, any> = {};
      const good: Record<string, any> = {};
      for (const [id, audit] of Object.entries(audits)) {
        const s = audit.score;
        if (s === null || s === 0 || (typeof s === 'number' && s < 0.5)) {
          critical[id] = audit;
        } else {
          good[id] = audit;
        }
      }
      // Stream PDF response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');
      const doc = new PDFDocument({ margin: 40 });
      doc.pipe(res);

      // Title page
      doc
        .fontSize(22)
        .text('Lighthouse Report', { align: 'center' })
        .moveDown()
        .fontSize(12)
        .text(`URL: ${report.fetchedUrl ?? report.url ?? 'N/A'}`, {
          align: 'center',
        })
        .text(`Date: ${new Date().toLocaleString()}`, { align: 'center' });

      // Dynamic sections
      this.writeCategorySection(doc, categories);
      this.writeAuditSection(doc, critical, 'Critical Issues');
      this.writeAuditSection(doc, good, 'No Issues');

      doc.end();
    } catch (error: any) {
      logger.error(`Error generating Lighthouse PDF report: ${error}`);
      return { error: 'Failed to generate Lighthouse PDF report' };
    }
  }

  private async writeCategorySection(
    doc: typeof PDFDocument,
    categories: Record<string, CategoryEntry>
  ) {
    doc
      .addPage()
      .fontSize(18)
      .text('Categories', { underline: true })
      .moveDown(0.5);

    for (const [id, cat] of Object.entries(categories)) {
      const scorePct =
        typeof cat.score === 'number'
          ? `${Math.round(cat.score * 100)}%`
          : 'N/A';

      // You can still pull out well-known props if they exist:
      const title = cat.title ?? id;
      const description = cat.description ?? '';

      doc.fontSize(14).text(title).moveDown(0.1);

      doc.fontSize(12).text(`Score: ${scorePct}`, { indent: 20 });
      doc
        .fontSize(12)
        .text(`Description: ${description}`, { indent: 20 })
        .moveDown(0.5);
    }
  }

  private async writeAuditSection(
    doc: typeof PDFDocument,
    audits: Record<string, AuditEntry>,
    sectionTitle: string
  ) {
    doc
      .addPage()
      .fontSize(18)
      .text(sectionTitle, { underline: true })
      .moveDown(0.5);

    for (const [id, audit] of Object.entries(audits)) {
      const { title = id, score, description = '', displayValue } = audit;
      const scoreText = score == null ? 'N/A' : `${Math.round(score * 100)}%`;

      doc.fontSize(14).text(title).moveDown(0.1);

      doc.fontSize(12).text(`Score: ${scoreText}`, { indent: 20 });

      if (displayValue) {
        doc.text(`Value: ${displayValue}`, { indent: 20 });
      }

      // Optionally only first sentence
      const firstSentence = description ?? description;
      doc.text(`Description: ${firstSentence}`, { indent: 20 }).moveDown(0.5);
    }
  }
}

export default SeoService;
