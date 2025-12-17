import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { AuthJWTGuard } from '@auth/guard/auth.guard';
import { User } from '@utils/user-decorator';
import { type JWTPayload } from '@auth/models/auth.models';
import { FileInterceptor } from '@nestjs/platform-express';

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
  findAll() {
    return this.fileService.findAll();
  }

  @Get('download/:id')
  downloadOne(@Param('id') id: string) {
    return this.fileService.downloadOne(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
  }

  @Put('update/:id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(+id, updateFileDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }
}
