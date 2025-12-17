import { Controller, Get, Post, Param, Delete, Put, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, Res, Query } from '@nestjs/common';
import { FileService } from './file.service';
import type { Response } from 'express';
import { AuthJWTGuard } from '@auth/guard/auth.guard';
import { User } from '@utils/user-decorator';
import { type JWTPayload } from '@auth/models/auth.models';
import { FileInterceptor } from '@nestjs/platform-express';
import { type FileListQuery } from './models/file.models';

@UseGuards(AuthJWTGuard)
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: (1000 * 1024 * 5) }), //5MB
        ],
      })
    ) file: Express.Multer.File,
    @User() payload: JWTPayload
  ) {
    return this.fileService.create(file, payload);
  }

  @Get('list')
  findAll(@Query() query: FileListQuery) {
    return this.fileService.findAll(
      Number(query.page),
      Number(query.list_size)
    );
  }

  @Get('download/:id')
  async downloadOne(@User() payload: JWTPayload, @Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    return this.fileService.downloadOne(id, payload.sub, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() payload: JWTPayload) {
    return this.fileService.findOne(id, payload.sub);
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('file'))
  update(@Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: (1000 * 1024 * 5) }), //5MB
        ],
      })
    ) file: Express.Multer.File,
    @User() payload: JWTPayload
  ) {
    return this.fileService.update(id, file, payload);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @User() payload: JWTPayload) {
    return this.fileService.remove(id, payload.sub);
  }
}
