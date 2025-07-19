import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IPayload } from '../interfaces';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as IPayload;
  },
);
