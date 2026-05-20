import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepositoryPort, CreateUserDto, UpdateUserDto } from '../../domain/ports/user.repository.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserModel, UserDocument } from '../schemas/user.schema';
import { UserRole } from '../../../../common/enums/roles.enum';

@Injectable()
export class MongoUserRepository implements UserRepositoryPort {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ─── Mapper: MongoDB Document → Domain Entity ─────────────────────────────
  private toDomain(doc: UserDocument): UserEntity {
    return UserEntity.create({
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      passwordHash: doc.passwordHash,
      role: doc.role,
      fcmToken: doc.fcmToken,
      isActive: doc.isActive,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const doc = await this.userModel.findById(id).exec();
      return doc ? this.toDomain(doc) : null;
    } catch {
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(filters?: { role?: UserRole; isActive?: boolean }): Promise<UserEntity[]> {
    const query: any = {};
    if (filters?.role) query.role = filters.role;
    if (filters?.isActive !== undefined) query.isActive = filters.isActive;

    const docs = await this.userModel.find(query).sort({ createdAt: -1 }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const created = new this.userModel({
      email: dto.email.toLowerCase().trim(),
      name: dto.name,
      passwordHash: dto.passwordHash,
      role: dto.role,
      fcmToken: dto.fcmToken ?? null,
    });
    const saved = await created.save();
    return this.toDomain(saved);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    return updated ? this.toDomain(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel
      .countDocuments({ email: email.toLowerCase().trim() })
      .exec();
    return count > 0;
  }
}
