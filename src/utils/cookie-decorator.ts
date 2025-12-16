import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserType } from '@user/entities/user.entity';


export const Cookie = createParamDecorator(
    (data: any, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const cookies = request.cookies as any;
        return data ? cookies[data] : cookies;
    },
);

