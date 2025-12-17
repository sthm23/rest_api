import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post('upload')
  create(@Body() createFileDto: CreateFileDto) {
    return this.fileService.create(createFileDto);
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
