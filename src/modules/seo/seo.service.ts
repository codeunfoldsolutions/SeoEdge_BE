import { launch } from 'chrome-launcher';
import { Response } from 'express';
import lighthouse from 'lighthouse';
import mongoose, { Model, mongo, Types } from 'mongoose';
import { ISeo, ISeoDocument, SeoModel } from '../../models/seo.model';
import logger from '../../config/logger';
import PDFDocument from 'pdfkit';
import {
  lighthousePDFResponse,
  CategoryEntry,
  AuditEntry,
} from '../../types/seo';
import { Pagination } from '../../utils/pagination';
import { AuditModel, IAudit, IAuditDocument } from '../../models/audit.model';

class SeoService {
  private static instance: SeoService;
  private seoModel: Model<ISeoDocument>;
  private auditModel: Model<IAuditDocument>;

  private constructor() {
    this.seoModel = SeoModel;
    this.auditModel = AuditModel;
  }

  public static getInstance(): SeoService {
    if (!SeoService.instance) {
      SeoService.instance = new SeoService();
    }
    return SeoService.instance;
  }

  async findProjects(id: string, type: string, page?: number) {
    try {
      let pagination;
      if (type === 'dash') {
        //add pagination
        const paginationPage =
          typeof page === 'undefined'
            ? 0 // if page is undefined, use 0
            : Number(page) > 0
            ? Number(page) - 1
            : 0;
        pagination = new Pagination(5, Math.max(0, +paginationPage));
      }
      if (type === 'all') {
        const paginationPage =
          typeof page === 'undefined'
            ? 0 // if page is undefined, use 0
            : Number(page) > 0
            ? Number(page) - 1
            : 0;
        pagination = new Pagination(15, Math.max(0, +paginationPage));
      }
      // inside your async method
      const baseQuery = this.seoModel.find({ ownerId: id });

      const paginatedQuery = pagination
        ? baseQuery.skip(pagination.skip).limit(pagination.limit)
        : baseQuery;

      const project = await paginatedQuery.exec();

      const info = pagination!.getPaginationInfo(project.length);

      return {
        data: project ? [project] : [],
        info: project ? info : '',
      };
    } catch (error) {
      logger.error(`Error checking project existence: ${error}`);
      throw new Error('Failed to check project existence');
    }
  }
  async getProjectOverview(id: string) {
    try {
      // Aggregation pipeline
      const ownerId = new Types.ObjectId(id);
      const [overview] = await this.seoModel
        .aggregate<{
          totalProjects: number;
          activeProjects: number;
          totalIssues: number;
          averageScore: number;
        }>([
          { $match: { ownerId } }, // restrict to this user’s docs
          {
            $group: {
              _id: null,
              totalProjects: { $sum: 1 }, // count all docs
              activeProjects: { $sum: { $cond: ['$active', 1, 0] } }, // count where active===true
              totalIssues: { $sum: '$criticalCount' }, // sum all criticalCount fields
              averageScore: { $avg: '$score' }, // avg of score fields
            },
          },
          {
            $project: {
              _id: 0,
              totalProjects: 1,
              activeProjects: 1,
              totalIssues: 1,
              // convert averageScore (0–1 scale?) to percent if needed:
              // averageScore: { $multiply: ['$averageScore', 100] }
              averageScore: 1,
            },
          },
        ])
        .exec();

      const result = overview ?? {
        totalProjects: 0,
        activeProjects: 0,
        totalIssues: 0,
        averageScore: 0,
      };
      return { data: result };
    } catch (error) {
      logger.error(`Error checking project existence: ${error}`);
      throw new Error('Failed to check project existence');
    }
  }
  async createNewSeoProject(data: ISeo) {
    try {
      const seoEntry = await this.seoModel.create(data);
      return { data: seoEntry };
    } catch (error) {
      logger.error(`Error creating new SEO entry: ${error}`);
      return { error: 'Failed to create SEO entry' };
    }
  }
  async updateSeoEntry(id: string, data: any) {
    try {
      const project = await this.seoModel.findByIdAndUpdate(
        id,
        {
          $set: data,
        },
        { new: true } // Return the updated document
      );
      return { data: project ? [project] : [] };
    } catch (error) {
      logger.error(`Error checking project existence: ${error}`);
      return { error: 'Failed to update Project entry' };
    }
  }

  async findAllAudits(id: string, page?: number) {
    try {
      let pagination;

      const paginationPage =
        typeof page === 'undefined'
          ? 0 // if page is undefined, use 0
          : Number(page) > 0
          ? Number(page) - 1
          : 0;
      pagination = new Pagination(10, Math.max(0, +paginationPage));
      // inside your async method
      const baseQuery = this.auditModel
        .find({ ownerId: id })
        .populate('projectId');

      const paginatedQuery = pagination
        ? baseQuery.skip(pagination.skip).limit(pagination.limit)
        : baseQuery;

      const project = await paginatedQuery.exec();

      const info = pagination!.getPaginationInfo(project.length);

      return {
        data: project ? [project] : [],
        info: project ? info : '',
      };
    } catch (error) {
      logger.error(`Error finding audit history: ${error}`);
      return { error: 'Failed to create audit entry' };
    }
  }
  async createNewAudit(data: IAudit) {
    try {
      const auditEntry = await this.auditModel.create(data);
      return { data: auditEntry };
    } catch (error) {
      logger.error(`Error creating new audit entry: ${error}`);
      return { error: 'Failed to create audit entry' };
    }
  }
  async getAuditOverview(id: string) {
    try {
      const ownerId = new Types.ObjectId(id);
      const [overview] = await this.auditModel
        .aggregate([
          // 1) Filter to this user
          { $match: { ownerId } },

          // 2) Group into a single doc
          {
            $group: {
              _id: null,

              // total number of audit documents
              totalAudits: { $sum: 1 },

              // count only those whose status is 'completed'
              completedAudits: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                },
              },

              // average duration: convert string to double
              avgDuration: { $avg: { $toDouble: '$duration' } },

              // sum of all criticalCount fields
              totalIssues: { $sum: '$criticalCount' },

              // average of the overall audit score
              avgImprovement: { $avg: '$score' },
            },
          },

          // 3) Shape the output document, remove _id
          {
            $project: {
              _id: 0,
              totalAudits: 1,
              completedAudits: 1,
              avgDuration: 1,
              totalIssues: 1,
              avgImprovement: 1,
            },
          },
        ])
        .exec();

      // Default to zeroes if no audits exist
      const result = overview ?? {
        totalAudits: 0,
        completedAudits: 0,
        avgDuration: 0,
        totalIssues: 0,
        avgImprovement: 0,
      };
      return { data: result };
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

  async compareLastTwoAudits(ownerId: string) {
    try {
      const docs = await this.auditModel
        .aggregate<IAudit & { createdAt: Date }>([
          { $match: { ownerId: new Types.ObjectId(ownerId) } },
          { $sort: { createdAt: -1 } },
          { $limit: 2 },
          { $project: { categories: 1, createdAt: 1 } },
        ])
        .exec();

      if (docs.length === 0) {
        // No audits at all
        return [];
      }

      const latest = docs[0];
      const previous = docs[1];

      return Object.entries(latest.categories).map(([key, currScoreRaw]) => {
        const currPct = currScoreRaw * 100;
        const current = `${Math.round(currPct)}/100`;

        if (!previous) {
          // Only one audit exists
          return {
            category: key,
            current,
            change: `+0%`,
          };
        }

        // Two audits exist, do full comparison
        const prevScoreRaw = (previous.categories as any)[key] ?? 0;
        const prevPct = prevScoreRaw * 100;
        const difference = currPct - prevPct;
        const sign = difference >= 0 ? '+' : '';
        return {
          category: key,
          current,
          previous: `${Math.round(prevPct)}/100`,
          change: `${sign}${difference.toFixed(1)}%`,
          direction:
            difference >= 0
              ? 'Higher than last audit'
              : 'Lower than last audit',
        };
      });
    } catch (error) {
      logger.error(`Error checking audit comparisons : ${error}`);
      return { error: 'Failed to check audit comparisons' };
    }
  }

  async getSeoEntries(ownerId: string) {
    try {
      const seoEntries = await this.seoModel.find({ ownerId });
      return { data: seoEntries };
    } catch (error) {
      logger.error(`Error fetching SEO entries: ${error}`);
      return { error: 'Failed to fetch SEO entries' };
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
      return { error: 'Failed to check project existence' };
    }
  }

  async lightHouseGenerateAudit(url: string) {
    const start = Date.now();
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

      const durationMs = Date.now() - start;

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

      //gets audit score
      function getAverageAuditScore(
        processedAudits: Record<string, { score: number }>
      ): number {
        const scores = Object.values(processedAudits).map(
          (item) => item.score ?? 0
        );

        const count = scores.length;
        if (count === 0) return 0;

        const total = scores.reduce((sum, s) => sum + s, 0);
        const average = total / count;

        return average * 100;
      }

      const score = getAverageAuditScore(processedAudits);

      // Count critical issues (score < 0.5 or score == 0)
      const criticalCount = Object.values(audits).reduce((count, a) => {
        return count + (a.score === null || a.score < 0.5 ? 1 : 0);
      }, 0);

      return {
        categories: {
          performance: categories.performance.score ?? 0,
          accessibility: categories.accessibility.score ?? 0,
          seo: categories.seo.score ?? 0,
          bestPractices: categories['best-practices'].score ?? 0,
        },
        audits: processedAudits,
        criticalCount,
        score,
        durationMs,
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
