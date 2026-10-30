import mongoose from 'mongoose';
import { PosSessionModel, IPosSession, ILiveCart } from '../models/pos-session.model.js';

export class PosSessionRepository {
  async findOrCreateSession(storeId: string, shiftId: string, sessionCode: string): Promise<IPosSession> {
    const storeObjectId = new mongoose.Types.ObjectId(storeId);
    const shiftObjectId = new mongoose.Types.ObjectId(shiftId);

    let session = await PosSessionModel.findOne({ session_code: sessionCode });
    if (!session) {
      session = await PosSessionModel.create({
        store_id: storeObjectId,
        shift_id: shiftObjectId,
        session_code: sessionCode,
        status: 'ACTIVE',
        current_cart: {
          items: [],
          subtotal: 0,
          discount: 0,
          finalTotal: 0,
          tableNumber: '',
          customerName: 'Khách lẻ',
          lockedBy: null,
          lockedByName: null,
          lockedAt: null,
        },
        active_staff_ids: [],
      });
    }
    return session;
  }

  async getSessionByCode(sessionCode: string): Promise<IPosSession | null> {
    return PosSessionModel.findOne({ session_code: sessionCode });
  }

  async updateCart(sessionCode: string, cart: ILiveCart): Promise<IPosSession | null> {
    return PosSessionModel.findOneAndUpdate(
      { session_code: sessionCode },
      { $set: { current_cart: cart, updated_at: new Date() } },
      { new: true }
    );
  }

  async lockCart(
    sessionCode: string,
    lockedBy: string | null,
    lockedByName: string | null
  ): Promise<IPosSession | null> {
    return PosSessionModel.findOneAndUpdate(
      { session_code: sessionCode },
      {
        $set: {
          'current_cart.lockedBy': lockedBy,
          'current_cart.lockedByName': lockedByName,
          'current_cart.lockedAt': lockedBy ? new Date() : null,
          updated_at: new Date(),
        },
      },
      { new: true }
    );
  }

  async clearCart(sessionCode: string): Promise<IPosSession | null> {
    return PosSessionModel.findOneAndUpdate(
      { session_code: sessionCode },
      {
        $set: {
          current_cart: {
            items: [],
            subtotal: 0,
            discount: 0,
            finalTotal: 0,
            tableNumber: '',
            customerName: 'Khách lẻ',
            lockedBy: null,
            lockedByName: null,
            lockedAt: null,
          },
          updated_at: new Date(),
        },
      },
      { new: true }
    );
  }

  async addActiveStaff(sessionCode: string, userId: string): Promise<void> {
    await PosSessionModel.updateOne(
      { session_code: sessionCode },
      { $addToSet: { active_staff_ids: userId } }
    );
  }

  async removeActiveStaff(sessionCode: string, userId: string): Promise<void> {
    await PosSessionModel.updateOne(
      { session_code: sessionCode },
      { $pull: { active_staff_ids: userId } }
    );
  }
}
