import { BadRequestException, ForbiddenException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import path, { join } from 'node:path';
import type { Response } from 'express';
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
        path: filePath,
      });

      return this.filesRepo.save(newFile);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(page = 1, list_size = 10) {
    try {
      const files = await this.filesRepo.find({
        skip: (page - 1) * list_size,
        take: list_size,
      });
      const count = await this.filesRepo.count();
      return {
        data: files,
        page: page,
        list_size: list_size,
        count: count,
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string, userId: number) {
    try {
      const file = await this.filesRepo.findOneBy({ id });

      if (!file) throw new NotFoundException('File not found');
      if (file.user_id !== userId) {
        throw new ForbiddenException('You do not have access to update this file');
      }

      return file;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, file: Express.Multer.File, payload: JWTPayload) {
    try {
      const existFile = await this.filesRepo.findOneBy({ id });
      if (!existFile) throw new NotFoundException('File not found');
      if (existFile.user_id !== payload.sub) {
        throw new ForbiddenException('You do not have access to update this file');
      }
      const filePath = await this.handleFile(file);
      const newFile = {
        ...existFile,
        user_id: payload.sub,
        original_name: file.originalname,
        extension: file.originalname.split('.').pop()!,
        mime_type: file.mimetype,
        size: file.size.toString(),
        path: filePath,
      };
      FileHelper.deleteFile(file.path);

      return this.filesRepo.save(newFile);

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async downloadOne(id: string, userId: number, res: Response): Promise<StreamableFile> {
    const existFile = await this.filesRepo.findOneBy({ id });
    if (!existFile) throw new NotFoundException('File not found');
    if (existFile.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this file');
    }
    const file = createReadStream(join(process.cwd(), existFile.path));
    const fileName = path.basename(existFile.original_name);

    res.set({
      'Content-Type': existFile.mime_type,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
    });
    return new StreamableFile(file);
  }

  async remove(id: string, userId: number) {
    try {
      const file = await this.filesRepo.findOneBy({ id });
      if (!file) throw new NotFoundException('File not found');
      if (file.user_id !== userId) {
        throw new ForbiddenException('You do not have access to delete this file');
      }
      FileHelper.deleteFile(file.path);
      await this.filesRepo.delete(id);
      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


  private async handleFile(file: Express.Multer.File) {
    try {
      const fileName = file.originalname
      FileHelper.writeFile(fileName, file.buffer);
      return `/uploads/${fileName}`;
    } catch (error) {
      throw new ForbiddenException(error?.message);
    }
  }
}
