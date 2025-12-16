import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthJWTGuard } from '@auth/guard/auth.guard';
import { User } from '@utils/user-decorator';
import { type JWTPayload } from '@auth/models/auth.models';

@UseGuards(AuthJWTGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('info')
  findOne(@User() payload: JWTPayload) {
    return this.userService.findOneById(payload.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
