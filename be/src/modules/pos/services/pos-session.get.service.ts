import { PosSessionRepository } from '../repositories/pos-session.repository.js';
import { ILiveCart } from '../models/pos-session.model.js';

export class PosSessionGetService {
  private repo: PosSessionRepository;

  constructor() {
    this.repo = new PosSessionRepository();
  }

  async execute(storeId: string, shiftId: string, sessionCode: string): Promise<{
    sessionCode: string;
    cart: ILiveCart;
    activeStaffIds: string[];
  }> {
    const session = await this.repo.findOrCreateSession(storeId, shiftId, sessionCode);
    return {
      sessionCode: session.session_code,
      cart: session.current_cart,
      activeStaffIds: session.active_staff_ids || [],
    };
  }
}
