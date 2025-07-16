import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard activated'); // Debug log
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    console.log('JwtAuthGuard handleRequest:', { err, user, info }); // Debug log
    if (err || !user) {
      console.log('Auth failed:', err || 'No user'); // Debug log
      if (err) throw err;
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
