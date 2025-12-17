import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateFileDto } from './dto/update-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity'
import { JWTPayload } from '@auth/models/auth.models';
import { FileHelper } from '@utils/file.helper';
@Injectable()
export class FileService {

  constructor(
    @InjectRepository(File)
    private filesRepo: Repository<File>,
  ) { }

  async create(file: Express.Multer.File, payload: JWTPayload) {
    try {
      const filePath = await this.handleFile(file);
      const newFile = this.filesRepo.create({
        user_id: payload.sub,
        original_name: file.originalname,
        extension: file.originalname.split('.').pop()!,
        mime_type: file.mimetype,
        size: file.size.toString(),
        path: file.path,
        url: filePath,
      });

      return this.filesRepo.save(newFile);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async handleFile(file: Express.Multer.File) {
    try {
      const fileName = file.originalname
      const originalBuffer = await FileHelper.compressImage(file);
      FileHelper.writeFile(fileName, originalBuffer);
      return `/static/${fileName}`;
    } catch (error) {
      throw new ForbiddenException(error?.message);
    }
  }

  findAll() {
    try {
      return this.filesRepo.find();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const file = await this.filesRepo.findOneBy({ id });

      if (!file) throw new NotFoundException('File not found');

      return file;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
