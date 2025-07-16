import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret: string =
      configService.get<string>('JWT_SECRET') || 'abcdxyz1234';
    console.log('JWT_SECRET being used:', secret); // Debug log

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): { id: string; email: string } {
    console.log('JWT payload received:', payload); // Debug log
    return { id: payload.sub, email: payload.email };
  }
}
