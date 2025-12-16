import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthJWTGuard } from '@auth/guard/auth.guard';

@UseGuards(AuthJWTGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findOneById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
