import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { FilterQuery, Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly firebaseService: FirebaseService,
  ) {}

  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async hashedPasword(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async create(body: Partial<User>): Promise<User> {
    const user = new this.userModel({
      ...body,
      password: await this.hashedPasword(body.password),
      sessionKey: this.generateSessionToken(),
    });
    return await user.save();
  }

  async getUser(query: FilterQuery<User>) {
    const user = await this.userModel.findOne(query);
    if (!user) {
      return null;
    }
    return user;
  }

  async updateUser(id: string, body: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true },
    );
    return user;
  }

  async subscribeUserToTopic(userId: string, token: string) {
    return this.firebaseService.subscribeUserToTopic(userId, token);
  }
}
