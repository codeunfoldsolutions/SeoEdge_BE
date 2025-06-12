import mongoose, { Schema, Document } from 'mongoose';
import { IUserDocument } from './user.model';

// Interface representing a User document in MongoDB
export interface ISeo {
  ownerId: IUserDocument;
  url: string;
  title: string;
  description: string;
  keywords: string[];
  criticalCount?: number;
  minorCount?: number;
  active?: boolean;
  score?: number;
  auditsCount?: number;
  // categories: {
  //   performance: number;
  //   accessibility: number;
  //   bestPractices: number;
  //   seo: number;
  // };
  // audits: {
  //   'is-on-https': {
  //     score: number;
  //     description: string;
  //   };
  //   'redirects-http': {
  //     score: number;
  //     description: string;
  //   };
  //   viewport: {
  //     score: number;
  //     description: string;
  //   };
  //   'first-contentful-paint': {
  //     score: number;
  //     displayValue: string;
  //     description: string;
  //   };
  //   'first-meaningful-paint': {
  //     score: number;
  //     description: string;
  //   };
  //   speedIndex: {
  //     score: number;
  //     displayValue: string;
  //     description: string;
  //   };
  //   'errors-in-console': {
  //     score: number;
  //     description: string;
  //   };
  //   interactive: {
  //     score: number;
  //     displayValue: string;
  //     description: string;
  //   };
  //   'bootup-time': {
  //     score: number;
  //     displayValue: string;
  //     description: string;
  //   };
  // };
}

const AuditDetailSchema = new Schema(
  {
    score: { type: Number, required: true },
    description: { type: String, required: true },
    displayValue: { type: String },
  },
  { _id: false }
);

const AuditsSchema = new Schema(
  {
    'is-on-https': AuditDetailSchema,
    'redirects-http': AuditDetailSchema,
    viewport: AuditDetailSchema,
    'first-contentful-paint': AuditDetailSchema,
    'first-meaningful-paint': AuditDetailSchema,
    speedIndex: AuditDetailSchema,
    'errors-in-console': AuditDetailSchema,
    interactive: AuditDetailSchema,
    'bootup-time': AuditDetailSchema,
  },
  { _id: false }
);

const CategoriesSchema = new Schema(
  {
    performance: { type: Number, required: true },
    accessibility: { type: Number, required: true },
    bestPractices: { type: Number, required: true },
    seo: { type: Number, required: true },
  },
  { _id: false }
);

// Interface for User model, extending both IUser and Document
export interface ISeoDocument extends ISeo, Document {
  // You can add instance methods here if needed
  // For example: comparePassword(candidatePassword: string): Promise<boolean>;
}

const seoSchema = new Schema<ISeoDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      // required: true
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      required: true,
    },
    auditsCount: {
      type: Number,
      default: 0,
      required: true,
    },
    description: {
      type: String,
      // required: true
    },
    criticalCount: {
      type: Number,
      default: 0,
      // required: true
    },
    minorCount: {
      type: Number,
      default: 0,
      // required: true
    },
    keywords: [{ type: String }],
    // categories: {
    //   type: CategoriesSchema,
    //   required: true,
    // },
    // audits: {
    //   type: AuditsSchema,
    //   required: true,
    // },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Create and export the model
export const SeoModel = mongoose.model<ISeoDocument>('Seo', seoSchema);
