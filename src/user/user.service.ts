import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordHashHelper } from '@utils/password-hash.helper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService
  ) { }


  async create(createUserDto: CreateUserDto) {

    try {
      const user = await this.usersRepository.findOneBy({ login: createUserDto.login });
      if (user) throw new ForbiddenException('login already existing');

      const userEntity = this.usersRepository.create(createUserDto);
      userEntity.password = await PasswordHashHelper.hash(
        userEntity.password,
        +this.configService.get('SALT')
      );
      const newUser = await this.usersRepository.save(userEntity);
      return { ...newUser, password: undefined };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  findOneById(id: number) {
    return this.usersRepository.findOneByOrFail({ id });
  }

  findOneByLogin(login: string) {
    return this.usersRepository.findOneBy({ login });
  }

  async remove(id: number) {
    try {
      await this.usersRepository.update(id, { isActive: false });
      return { message: 'User deactivated successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to deactivate user');
    }
  }
}
