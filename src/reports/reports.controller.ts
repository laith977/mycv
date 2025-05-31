import { Controller, Post, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportsService } from './reports.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { ReportDto } from './dtos/report-dto';
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  @Post()
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(body, user);
  }

  @Get()
  getReports() {
    // Logic to get all reports
    return 'List of reports';
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  updateReport() {
    // Logic to update a report by ID
    return 'Report updated';
  }
}
