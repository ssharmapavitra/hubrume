import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get(':id/pdf')
  async getProfilePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.pdfService.generateProfilePdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resume-${id}.pdf"`);
    res.send(pdfBuffer);
  }
}

