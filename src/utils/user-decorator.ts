import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserType } from '@user/entities/user.entity';


export const User = createParamDecorator(
    (data: keyof UserType, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as UserType;
        return data ? user[data] : user;
    },
);