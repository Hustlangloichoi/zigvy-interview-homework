import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { User } from 'users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    console.log('Login attempt for email:', loginDto.email); // Debug log
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      console.log('User not found:', email); // Debug log
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email); // Debug log
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      sub: String(user._id),
      email: user.email,
    };
    console.log('Creating token with payload:', payload); // Debug log
    const accessToken = await this.jwtService.signAsync(payload);
    console.log('Token created successfully'); // Debug log
    return { accessToken };
  }

  async signup(signupDto: SignupDto): Promise<{ accessToken: string }> {
    const { email, password } = signupDto;
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({ email, password: hashedPassword });
    await newUser.save();

    const payload = {
      sub: String(newUser._id),
      email: newUser.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}
