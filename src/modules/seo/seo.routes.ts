import { Router } from 'express';
import { validateData, verifyJWT } from '../../middlewares';
import { seoCreationSchema } from './seo.validation';
import SeoController from './seo.controller';
import SeoService from './seo.service';

const SeoRouter = Router();
const seoController = new SeoController(SeoService.getInstance());

// Create new seo project
SeoRouter.post(
  '/create',
  verifyJWT,
  validateData(seoCreationSchema),
  seoController.handleCreateSeo.bind(seoController)
);

export default SeoRouter;
