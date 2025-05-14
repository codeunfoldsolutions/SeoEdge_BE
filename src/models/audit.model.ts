import mongoose, { Schema, Document } from 'mongoose';
import { IUserDocument } from './user.model';
import { ISeoDocument } from './seo.model';

// Interface representing a User document in MongoDB
export interface IAudit {
  ownerId: IUserDocument;
  projectId: ISeoDocument;
  duration: string;
  type?: string;
  status: string;
  criticalCount: number;
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
  score: number;
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
export interface IAuditDocument extends IAudit, Document {
  // You can add instance methods here if needed
  // For example: comparePassword(candidatePassword: string): Promise<boolean>;
}

const auditSchema = new Schema<IAuditDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Seo',
      required: true,
    },
    duration: {
      type: String,
      // required: true
    },
    type: {
      type: String,
      default: 'manual',
      enum: ['manual', 'scheduled'],
      // required: true
    },
    status: {
      type: String,
      default: 'completed',
      enum: ['running', 'completed'],
      // required: true
    },
    criticalCount: {
      type: Number,
      // required: true
    },
    score: {
      type: Number,
      // required: true
    },
    categories: {
      type: CategoriesSchema,
      required: true,
    },
    audits: {
      type: AuditsSchema,
      required: true,
    },
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
export const AuditModel = mongoose.model<IAuditDocument>('Audit', auditSchema);
