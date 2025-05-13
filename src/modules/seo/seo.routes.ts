import { Router } from 'express';
import { validateData, verifyJWT } from '../../middlewares';
import {
  seoCreationRequest,
  pdfGenerationRequest,
  runAuditRequest,
} from './seo.validation';
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
  '/projects/all',
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

//Gets all audits
SeoRouter.get(
  '/audits/all',
  verifyJWT,
  seoController.handleGetAllAudits.bind(seoController)
);
// Run audit
SeoRouter.get(
  '/audit/:projectId',
  verifyJWT,
  validateData(runAuditRequest),
  seoController.handleRunAudit.bind(seoController)
);

//create pdf report
SeoRouter.get(
  '/pdf/:id',
  verifyJWT,
  validateData(pdfGenerationRequest),
  seoController.handleGeneratePdf.bind(seoController)
);

// // Get seo project by id
// SeoRouter.post(
//   '/create',
//   verifyJWT,
//   validateData(seoCreationSchema),
//   seoController.handleCreateSeo.bind(seoController)
// );

export default SeoRouter;
