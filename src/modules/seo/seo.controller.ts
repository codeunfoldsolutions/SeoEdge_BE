import { Request, Response, NextFunction } from 'express';
import logger from '../../config/logger';
import { StatusCodes } from 'http-status-codes';
import type {
  seoCreationRequest,
  pdfGenerationRequest,
  rerunSeoRequest,
  runAuditRequest,
} from '../../types/seo';
import SeoService from './seo.service';
import { handleResponse } from '../../utils';
import mongoose from 'mongoose';

class SeoController {
  private seoService: SeoService;

  constructor(seoService: SeoService) {
    this.seoService = seoService;
  }

  async handleGetProjectsForDash(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1 } = req.query;
      const rawPage = Number(page) || 1;
      // Now pageNum is a valid number
      const existingSeo = await this.seoService.findProjects(
        req.user,
        'dash',
        rawPage
      );

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'SEO dashboard fetched successfully',
        { data: existingSeo.data, info: existingSeo.info }
      );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }

  async handleGetAllProjects(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rawPage = req.query.page;
      let pageNum = 0;

      if (typeof rawPage === 'string') {
        const parsed = Number(rawPage);
        pageNum = Number.isNaN(parsed) ? 0 : parsed;
      }

      // Now pageNum is a valid number
      const existingSeo = await this.seoService.findProjects(
        req.user,
        'all',
        pageNum
      );

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'SEO projects fetched successfully',
        { data: existingSeo.data, info: existingSeo.info }
      );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }
  async handleCompareRecentAudits(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { projectId } = req.params;
    try {
      //check if it is a valid mongoId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Invalid project id`
        );
      }
      // Now pageNum is a valid number
      const result = await this.seoService.compareLastTwoAudits(
        req.user,
        projectId
      );

      console.log(result);

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'SEO audits comparison fetched fetched successfully',
        { data: result }
      );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }

  async handleGetProjectOverview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Now pageNum is a valid number
      const projectOverview = await this.seoService.getProjectOverview(
        req.user
      );

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'SEO projects overview fetched successfully',
        { data: projectOverview.data }
      );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }

  public async handleNewProject(
    req: seoCreationRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        url,
        title,
        description = '',
        keywords = [],
        type = '',
      } = req.body;

      // check if user the already has an entry in the system
      const existingSeo = await this.seoService.checkIfProjectExists(req.user, {
        $regex: url as string,
        $options: 'i',
      });

      if (existingSeo?.error) {
        return handleResponse(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          `Something went wrong, please try again later`,
          { error: existingSeo.error }
        );
      }

      if (existingSeo!.data!.length >= 1) {
        return handleResponse(
          res,
          StatusCodes.CONFLICT,
          `You already have an entry for ${url}`
        );
      }
      // // Generate Light House Seo
      // const lightResponse = await this.seoService.lightHouseGenerateDashReport(
      //   url
      // );

      // // Check if an error occurred during light house creation

      // if (lightResponse?.error) {
      //   return handleResponse(
      //     res,
      //     StatusCodes.BAD_REQUEST,
      //     `Lighthouse audit failed for ${url}`,
      //     { error: lightResponse.error }
      //   );
      // }

      const seoData = {
        ownerId: req.user,
        url,
        title,
        description,
        keywords,
        type,
        // categories: lightResponse!.categories!,
        // audits: lightResponse!.audits!,
        // criticalCount: lightResponse!.criticalCount!,
      };

      //create new seo entry
      const newProject = await this.seoService.createNewSeoProject(seoData);

      // Check if an error occurred during seo entry creation
      if (newProject?.error) {
        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Failed to create SEO entry`,
          { error: newProject.error }
        );
      }

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'New Project created successfully',
        { data: newProject.data }
      );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }

  async handleGetAllAudits(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const id = req.user;
    try {
      const rawPage = req.query.page;
      let pageNum = 0;

      if (typeof rawPage === 'string') {
        const parsed = Number(rawPage);
        pageNum = Number.isNaN(parsed) ? 0 : parsed;
      }

      // // Check if project exists
      // const existingProject = await this.seoService.findProjectById(id);

      // if (existingProject?.data?.length !== 1) {
      //   return handleResponse(
      //     res,
      //     StatusCodes.NOT_FOUND,
      //     `Project doesn't exist`
      //   );
      // }

      //fetch all project audits
      const audits = await this.seoService.findAllAudits(id, pageNum);
      if (audits?.error) {
        return handleResponse(
          res,
          StatusCodes.NOT_FOUND,
          `Audits history couldn't be found`
        );
      }

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'Audits fetched successfully',
        { data: audits.data, info: audits.info }
      );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }
  async handleGetsAuditsForProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const ownerId = req.user;
    const projectId = req.params.projectId;
    try {
      const rawPage = req.query.page;
      let pageNum = 0;

      if (typeof rawPage === 'string') {
        const parsed = Number(rawPage);
        pageNum = Number.isNaN(parsed) ? 0 : parsed;
      }

      // Check if project exists
      const existingProject = await this.seoService.findProjectById(projectId);

      if (existingProject?.data?.length !== 1) {
        return handleResponse(
          res,
          StatusCodes.NOT_FOUND,
          `Project doesn't exist`
        );
      }

      //fetch all project audits
      const audits = await this.seoService.findAllAuditsForProject(
        ownerId,
        projectId,
        pageNum
      );
      if (audits?.error) {
        return handleResponse(
          res,
          StatusCodes.NOT_FOUND,
          `Audits history for ${existingProject.data[0].title} couldn't be found`
        );
      }

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'Audits fetched successfully',
        { data: audits.data, info: audits.info }
      );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }

  public async handleRunAudit(
    req: runAuditRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const id = req.params.projectId;
    try {
      //check if it is a valid mongoId
      if (!this.seoService.isValidObjectId(id) === false) {
        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Invalid project id`
        );
      }
      // check if user the already has an entry in the system
      const existingProject = await this.seoService.findProjectById(id);

      if (existingProject?.data?.length !== 1) {
        return handleResponse(
          res,
          StatusCodes.NOT_FOUND,
          `Project doesn't exist`
        );
      }

      // Generate Light House Seo
      const lightResponse = await this.seoService.lightHouseGenerateAudit(
        existingProject.data[0].url
      );

      // Check if an error occurred during light house creation
      if (lightResponse?.error) {
        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Lighthouse audit failed for ${existingProject.data[0].url}`,
          { error: lightResponse.error }
        );
      }

      const auditData = {
        ownerId: req.user,
        projectId: existingProject.data[0].id,
        duration: `${lightResponse!.durationMs}`,
        status: 'completed',
        score: lightResponse!.score as number,
        categories: lightResponse!.categories!,
        audits: lightResponse!.audits!,
        criticalCount: lightResponse!.criticalCount!,
      };

      //create new audit entry
      const newAudit = await this.seoService.createNewAudit(auditData);

      // Check if an error occurred during seo entry creation
      if (newAudit?.error) {
        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Failed to create SEO entry`,
          { error: newAudit.error }
        );
      }

      //update score and issues on the main data
      const data = {
        score: lightResponse!.score,
        criticalCount: lightResponse!.criticalCount,
      };

      const updatedProject = await this.seoService.updateSeoEntry(
        existingProject.data[0].id,
        data
      );
      // Check if an error occurred during seo entry creation
      if (updatedProject?.error) {
        return handleResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Failed to update SEO entry`,
          { error: updatedProject.error }
        );
      }

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'New Audit created successfully',
        { data: newAudit.data, fake: updatedProject.data }
      );
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }

  async handleGetAuditOverview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Now pageNum is a valid number
      const auditOverview = await this.seoService.getAuditOverview(req.user);

      return handleResponse(
        res,
        StatusCodes.CREATED,
        'SEO audit overview fetched successfully',
        { data: auditOverview }
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
        url: existingSeo!.data[0].url,
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
    } catch (err) {
      logger.error(`Something went wrong: ${err}`);
      next(err);
    }
  }
}

export default SeoController;
