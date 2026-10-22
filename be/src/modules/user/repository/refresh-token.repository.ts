import { Types } from 'mongoose';
import { RefreshTokenModel, type IRefreshTokenDoc } from '../models/refresh-token.model.js';

export class RefreshTokenRepository {
  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
    userAgent?: string | null;
    ipAddress?: string | null;
  }): Promise<IRefreshTokenDoc> {
    return RefreshTokenModel.create({
      user_id: new Types.ObjectId(data.userId),
      token: data.token,
      expires_at: data.expiresAt,
      user_agent: data.userAgent || null,
      ip_address: data.ipAddress || null,
    });
  }

  async findValidToken(token: string): Promise<IRefreshTokenDoc | null> {
    return RefreshTokenModel.findOne({
      token,
      revoked_at: null,
      expires_at: { $gt: new Date() },
    })
      .populate('user_id')
      .exec();
  }

  async revokeToken(token: string): Promise<void> {
    await RefreshTokenModel.updateOne(
      { token, revoked_at: null },
      { $set: { revoked_at: new Date() } }
    ).exec();
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { user_id: new Types.ObjectId(userId), revoked_at: null },
      { $set: { revoked_at: new Date() } }
    ).exec();
  }
}
