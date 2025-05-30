import { UsersService } from './users.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    //see if email is in use
    const existingUser = await this.usersService.find(email);
    if (existingUser.length) {
      throw new BadRequestException('Email in use');
    }
    // hash the password
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    // create a new user and save it
    const user = await this.usersService.create(email, result);

    // return the user
    return user; // This should be the created user object
  }
  async signin(email: string, password: string) {
    // find the user with the email
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // check if the password is correct
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('Invalid password');
    }
    // Optionally return the user or a token here
    return user;
  }
}
