import { IUserDocument } from '../models/user.model';
import { Request } from 'express';

export interface ISeo {
  ownerId: string;
  url: string;
  title: string;
  description: string;
  keywords: string[];
  criticalCount: number;
  active?: boolean;
  lastAudit?: Date;
  categories: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  audits: {
    'is-on-https': {
      score: number;
      description: string;
    };
    'redirects-http': {
      score: number;
      description: string;
    };
    viewport: {
      score: number;
      description: string;
    };
    'first-contentful-paint': {
      score: number;
      displayValue: string;
      description: string;
    };
    'first-meaningful-paint': {
      score: number;
      description: string;
    };
    speedIndex: {
      score: number;
      displayValue: string;
      description: string;
    };
    'errors-in-console': {
      score: number;
      description: string;
    };
    interactive: {
      score: number;
      displayValue: string;
      description: string;
    };
    'bootup-time': {
      score: number;
      displayValue: string;
      description: string;
    };
  };
}

export interface seoCreationRequest extends Request {
  body: {
    url: string;
    title: string;
    description: string;
    keywords: string[];
  };
}
export interface pdfGenerationRequest extends Request {
  params: {
    id: string;
  };
}

export interface lighthouseDashResponse {
  categories: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  audits: {
    'is-on-https': {
      score: number;
      desciption: string;
    };
    'redirects-http': {
      score: number;
      description: string;
    };
    viewport: {
      score: number;
      description: string;
    };
    'first-contentful-paint': {
      score: number;
      displayValue: string;
      description: string;
    };
    'first-meaningful-paint': {
      score: number;
      description: string;
    };
    speedIndex: {
      score: number;
      displayValue: string;
      description: string;
    };
    'errors-in-console': {
      score: number;
      description: string;
    };
    interactive: {
      score: number;
      displayValue: string;
      description: string;
    };
    'bootup-time': {
      score: number;
      displayValue: string;
      description: string;
    };
  };
}
export interface CategoryEntry {
  score: number | null;
  [key: string]: any;
}
export interface AuditEntry {
  score: number | null;
  description?: string;
  displayValue?: string;
  [key: string]: any;
}
export interface lighthousePDFResponse {
  categories: {
    [categoryId: string]: CategoryEntry;
  };
  audits: {
    [auditId: string]: AuditEntry;
  };
  [extra: string]: any; // catch-all for any other top-level fields
}

export interface SeoCreationResponse {
  message: string;
  data: ISeo;
}
