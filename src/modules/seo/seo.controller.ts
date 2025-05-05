import { Request, Response, NextFunction } from 'express';
import logger from '../../config/logger';
import { StatusCodes } from 'http-status-codes';
import type { seoCreationRequest, pdfGenerationRequest } from '../../types/seo';
import SeoService from './seo.service';
import { handleResponse } from '../../utils';

class SeoController {
  private seoService: SeoService;

  constructor(seoService: SeoService) {
    this.seoService = seoService;
  }

  public async handleCreateSeo(
    req: seoCreationRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { url, title, description, keywords } = req.body;

      // check if user the already has an entry in the system
      const existingSeo = await this.seoService.checkIfProjectExists(req.user, {
        $regex: url as string,
        $options: 'i',
      });

      if (existingSeo?.data?.length === 1) {
        return handleResponse(
          res,
          StatusCodes.CONFLICT,
          `You already have an entry for ${url}`
        );
      }
      // Generate Light House Seo
      const lightResponse = await this.seoService.lightHouseGenerateDashReport(
        url
      );

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
  async handleGetAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // check if user the already has an entry in the system
      console.log('user', req.user);
      const existingSeo = await this.seoService.findProjects(req.user);

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'SEO project fetched successfully',
        { data: existingSeo.data }
      );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }

  async handleGeneratePdf(
    req: pdfGenerationRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // check if user the already has an entry in the system
      const existingSeo = await this.seoService.findProjectById(id);

      if (existingSeo?.data?.length !== 1) {
        return handleResponse(
          res,
          StatusCodes.CONFLICT,
          `This project doesn't exist`
        );
      }
      // Generate Light House Seo
      const lightResponse = await this.seoService.lightHouseGeneratePDFReport(
        existingSeo!.data[0].url
      );

      // Check if an error occurred during light house creation
      if (lightResponse?.error) {
        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Lighthouse audit failed for ${
            existingSeo!.data[0].title
          } project failed `,
          { error: lightResponse.error }
        );
      }

      const lightHouseData = {
        categories: lightResponse!.categories!,
        audits: lightResponse!.audits!,
      };

      //convert the response to pdf
      const pdfResponse = await this.seoService.createPdfReport(
        lightHouseData!,
        res as Response
      );

      // Check if an error occurred during pdf creation
      if (pdfResponse?.error) {
        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Failed to create PDF`,
          { error: pdfResponse.error }
        );
      }

      // Check if an error occurred during seo entry creation
      // if (newSeo?.error) {
      //   return handleResponse(
      //     res,
      //     StatusCodes.BAD_REQUEST,
      //     `Failed to create SEO entry`,
      //     { error: newSeo.error }
      //   );
      // }

      // return handleResponse(
      //   res,
      //   StatusCodes.CREATED,
      //   'New Seo created successfully',
      //   { data: newSeo.data }
      // );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }
}

export default SeoController;
