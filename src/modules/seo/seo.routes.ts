import { Router } from 'express';
import { validateData, verifyJWT } from '../../middlewares';
import { seoCreationRequest, pdfGenerationRequest } from './seo.validation';
import SeoController from './seo.controller';
import SeoService from './seo.service';

const SeoRouter = Router();
const seoController = new SeoController(SeoService.getInstance());

// Create new seo project
SeoRouter.post(
  '/create',
  verifyJWT,
  validateData(seoCreationRequest),
  seoController.handleCreateSeo.bind(seoController)
);
//Get Seo Dashboard
SeoRouter.get(
  '/dashboard',
  verifyJWT
  // seoController.handleGetDashboard.bind(seoController)
);
// Get all seo projects
SeoRouter.get(
  '/all',
  verifyJWT,
  seoController.handleGetAll.bind(seoController)
);

//create pdf report
SeoRouter.post(
  '/pdf/:id',
  verifyJWT,
  // validateData(pdfGenerationRequest),
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
