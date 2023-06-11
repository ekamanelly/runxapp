import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  Delete,
  Header,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ResponseMessage } from 'src/common/interface/success-message.interface';
import { getFileContentType } from './file.util';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.fileService.uploadFile(file);
  }

  @Get('read/:fileName')
  async readFile(@Param('fileName') fileName: string, @Res() res) {
    const fileContentType = getFileContentType(fileName);
    res.set('Content-Type', fileContentType);
    const file = await this.fileService.readFile(fileName);
    return file.pipe(res);
  }

  @Get('download/:fileName')
  @Header('Content-Type', 'image/jpeg')
  async downloadFile(@Param('fileName') fileName: string, @Res() res) {
    const file = await this.fileService.readFile(fileName);
    const fileContentType = getFileContentType(fileName);
    res.set('Content-Type', fileContentType);
    res.set('Content-Disposition', `attachment; filename=${fileName}`);
    file.pipe(res);
  }

  @Delete('/:fileName')
  async deleteFile(@Param('fileName') fileName: string) {
    return await this.fileService.deleteFile(fileName);
  }
}
