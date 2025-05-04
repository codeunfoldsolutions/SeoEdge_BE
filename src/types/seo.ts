import { IUserDocument } from '../models/user.model';
import { Request } from 'express';

export interface ISeo {
  ownerId: string;
  url: string;
  title: string;
  description: string;
  keywords: string[];
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

export interface seoCreationSchema extends Request {
  body: {
    url: string;
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface lighthouseResponse {
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

export interface SeoCreationResponse {
  message: string;
  data: ISeo;
}
