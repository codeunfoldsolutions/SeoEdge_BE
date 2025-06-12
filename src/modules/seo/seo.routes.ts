import { Router } from 'express';
import { validateData, verifyJWT } from '../../middlewares';
import { seoCreationRequest, pdfGenerationRequest } from './seo.validation';
import SeoController from './seo.controller';
import SeoService from './seo.service';

const SeoRouter = Router();
const seoController = new SeoController(SeoService.getInstance());

//Get Seo Dashboard
SeoRouter.get(
  '/dashboard/project',
  verifyJWT,
  seoController.handleGetProjectsForDash.bind(seoController)
);

// Get all projects
SeoRouter.get(
  '/project/all',
  verifyJWT,
  seoController.handleGetAllProjects.bind(seoController)
);
//Get's project overview
SeoRouter.get(
  '/project/overview',
  verifyJWT,
  seoController.handleGetProjectOverview.bind(seoController)
);
// Create new seo project
SeoRouter.post(
  '/project/create',
  verifyJWT,
  validateData(seoCreationRequest),
  seoController.handleNewProject.bind(seoController)
);
// Get a project
SeoRouter.get(
  '/project/:projectId',
  verifyJWT,
  seoController.handleGetAProject.bind(seoController)
);

// Gets audits comparisons
SeoRouter.get(
  '/dashboard/compare/:projectId',
  verifyJWT,
  seoController.handleCompareRecentAudits.bind(seoController)
);
//Get's audit overview
SeoRouter.get(
  '/audits/overview',
  verifyJWT,
  seoController.handleGetAuditOverview.bind(seoController)
);
//Gets all audits
SeoRouter.get(
  '/audits/all',
  verifyJWT,
  seoController.handleGetAllAudits.bind(seoController)
);

//Gets all audits for a project
SeoRouter.get(
  '/audits/:projectId',
  verifyJWT,
  seoController.handleGetsAuditsForProject.bind(seoController)
);
// Runs audit
SeoRouter.post(
  '/audits/:projectId',
  verifyJWT,
  // validateData(runAuditRequest),
  seoController.handleRunAudit.bind(seoController)
);

//create pdf report
// SeoRouter.get(
//   '/pdf/:id',
//   verifyJWT,
//   // validateData(pdfGenerationRequest),
//   seoController.handleGeneratePdf.bind(seoController)
// );

export default SeoRouter;
