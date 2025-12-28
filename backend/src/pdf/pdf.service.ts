import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateProfilePdf(profileId: string): Promise<Buffer> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        education: {
          orderBy: {
            startDate: 'desc',
          },
        },
        workExperience: {
          orderBy: {
            startDate: 'desc',
          },
        },
        skills: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const html = this.generateHtml(profile);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private generateHtml(profile: any): string {
    const formatDate = (date: Date | null) => {
      if (!date) return 'Present';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          h2 {
            color: #34495e;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 5px;
          }
          .section {
            margin-bottom: 25px;
          }
          .bio {
            margin-bottom: 20px;
            font-style: italic;
            color: #555;
          }
          .contact {
            margin-bottom: 20px;
            color: #666;
          }
          .education-item, .work-item {
            margin-bottom: 15px;
            padding-left: 10px;
            border-left: 3px solid #3498db;
            padding-left: 15px;
          }
          .institution, .company {
            font-weight: bold;
            color: #2c3e50;
          }
          .degree, .position {
            color: #34495e;
            margin: 5px 0;
          }
          .dates {
            color: #7f8c8d;
            font-size: 0.9em;
          }
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .skill {
            background-color: #ecf0f1;
            padding: 5px 15px;
            border-radius: 20px;
            color: #2c3e50;
          }
        </style>
      </head>
      <body>
        <h1>${profile.name}</h1>
        
        ${profile.bio ? `<div class="bio">${profile.bio}</div>` : ''}
        ${profile.contactInfo ? `<div class="contact">${profile.contactInfo}</div>` : ''}
        ${profile.user.email ? `<div class="contact">Email: ${profile.user.email}</div>` : ''}
        
        ${profile.education.length > 0 ? `
          <h2>Education</h2>
          <div class="section">
            ${profile.education.map((edu: any) => `
              <div class="education-item">
                <div class="institution">${edu.institution}</div>
                ${edu.degree ? `<div class="degree">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>` : ''}
                <div class="dates">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${profile.workExperience.length > 0 ? `
          <h2>Work Experience</h2>
          <div class="section">
            ${profile.workExperience.map((work: any) => `
              <div class="work-item">
                <div class="company">${work.company}</div>
                <div class="position">${work.position}</div>
                ${work.description ? `<div>${work.description}</div>` : ''}
                <div class="dates">${formatDate(work.startDate)} - ${formatDate(work.endDate)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${profile.skills.length > 0 ? `
          <h2>Skills</h2>
          <div class="section">
            <div class="skills">
              ${profile.skills.map((skill: any) => `
                <span class="skill">${skill.name}${skill.level ? ` (${skill.level})` : ''}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }
}

