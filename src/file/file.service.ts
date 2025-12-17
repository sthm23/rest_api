import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity'
@Injectable()
export class FileService {

  constructor(
    @InjectRepository(File)
    private filesRepo: Repository<File>,
  ) { }

  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }

  findAll() {
    return `This action returns all file`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  downloadOne(id: number) {
    return `This action downloads a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
