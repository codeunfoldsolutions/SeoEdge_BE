import { Request, Response, NextFunction } from 'express';
import logger from '../../config/logger';
import { StatusCodes } from 'http-status-codes';
import type { seoCreationSchema } from '../../types/seo';
import SeoService from './seo.service';
import { handleResponse } from '../../utils';

class SeoController {
  private seoService: SeoService;

  constructor(seoService: SeoService) {
    this.seoService = seoService;
  }

  public async handleCreateSeo(
    req: seoCreationSchema,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { url, title, description, keywords } = req.body;

      // check if user the already has an entry in the system
      const existingSeo = await this.seoService.checkIfProjectExists(
        req.user.id,
        url
      );

      if (existingSeo?.data?.length === 1) {
        return handleResponse(
          res,
          StatusCodes.CONFLICT,
          `You already have an entry for ${url}`
        );
      }

      // Generate Light House Seo
      const lightResponse = await this.seoService.lightHouseGenerateReport(url);

      // Check if an error occurred during light house creation

      if (lightResponse?.error) {
        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Lighthouse audit failed for ${url}`,
          { error: lightResponse.error }
        );
      }

      const seoData = {
        ownerId: req.user,
        url,
        title,
        description,
        keywords,
        categories: lightResponse!.categories!,
        audits: lightResponse!.audits!,
      };

      //create new seo entry
      const newSeo = await this.seoService.createNewSeoEntry(seoData);

      // Check if an error occurred during seo entry creation
      if (newSeo?.error) {
        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Failed to create SEO entry`,
          { error: newSeo.error }
        );
      }

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'New Seo created successfully',
        { data: newSeo.data }
      );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }
}

export default SeoController;
