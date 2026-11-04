import { RecipeModel, type IRecipeDoc } from '../models/recipe.model.js';
import type { RecipeCreateDto, RecipeUpdateDto } from '../schemas/recipe.schema.js';

export class RecipeRepository {
  async findAll(filters?: {
    store_id?: string;
    type?: string;
    category?: string;
    search?: string;
    is_active?: boolean;
  }): Promise<IRecipeDoc[]> {
    const query: any = {};

    if (filters?.store_id) {
      query.$or = [
        { store_id: filters.store_id },
        { store_id: null },
        { store_id: { $exists: false } },
      ];
    }

    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active;
    }

    if (filters?.type && filters.type !== 'all') {
      query.type = filters.type;
    }

    if (filters?.category && filters.category !== 'all') {
      query.category = filters.category;
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    return RecipeModel.find(query).sort({ type: 1, category: 1, name: 1 }).exec();
  }

  async findById(id: string): Promise<IRecipeDoc | null> {
    return RecipeModel.findById(id).exec();
  }

  async findByCode(code: string): Promise<IRecipeDoc | null> {
    return RecipeModel.findOne({ code: code.trim().toUpperCase() }).exec();
  }

  async findByName(name: string, store_id?: string): Promise<IRecipeDoc | null> {
    const query: any = {
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    };
    if (store_id) {
      query.store_id = store_id;
    }
    return RecipeModel.findOne(query).exec();
  }

  async create(dto: RecipeCreateDto): Promise<IRecipeDoc> {
    return RecipeModel.create({
      store_id: dto.store_id || null,
      name: dto.name.trim(),
      code: dto.code?.trim().toUpperCase(),
      type: dto.type,
      category_id: dto.category_id || null,
      category: dto.category.trim(),
      price: dto.price ?? 0,
      estimated_cost: dto.estimated_cost ?? 0,
      description: dto.description?.trim() || null,
      image_url: dto.image_url?.trim() || null,
      serving_size: dto.serving_size?.trim() || '1 ly',
      serving_mode: dto.serving_mode || 'cold',
      cold_cup_id: dto.cold_cup_id || null,
      cold_cup_name: dto.cold_cup_name?.trim() || null,
      hot_cup_id: dto.hot_cup_id || null,
      hot_cup_name: dto.hot_cup_name?.trim() || null,
      prep_time_minutes: dto.prep_time_minutes ?? 5,
      shelf_life: dto.shelf_life?.trim() || null,
      storage_method: dto.storage_method?.trim() || null,
      ingredients: dto.ingredients || [],
      steps: dto.steps || [],
      is_active: dto.is_active ?? true,
    });
  }

  async update(id: string, dto: RecipeUpdateDto): Promise<IRecipeDoc | null> {
    return RecipeModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(dto.store_id !== undefined && { store_id: dto.store_id || null }),
          ...(dto.name && { name: dto.name.trim() }),
          ...(dto.code && { code: dto.code.trim().toUpperCase() }),
          ...(dto.type && { type: dto.type }),
          ...(dto.category_id !== undefined && { category_id: dto.category_id || null }),
          ...(dto.category && { category: dto.category.trim() }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.estimated_cost !== undefined && { estimated_cost: dto.estimated_cost }),
          ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
          ...(dto.image_url !== undefined && { image_url: dto.image_url?.trim() || null }),
          ...(dto.serving_size !== undefined && { serving_size: dto.serving_size?.trim() || '1 ly' }),
          ...(dto.serving_mode !== undefined && { serving_mode: dto.serving_mode }),
          ...(dto.cold_cup_id !== undefined && { cold_cup_id: dto.cold_cup_id || null }),
          ...(dto.cold_cup_name !== undefined && { cold_cup_name: dto.cold_cup_name?.trim() || null }),
          ...(dto.hot_cup_id !== undefined && { hot_cup_id: dto.hot_cup_id || null }),
          ...(dto.hot_cup_name !== undefined && { hot_cup_name: dto.hot_cup_name?.trim() || null }),
          ...(dto.prep_time_minutes !== undefined && { prep_time_minutes: dto.prep_time_minutes }),
          ...(dto.shelf_life !== undefined && { shelf_life: dto.shelf_life?.trim() || null }),
          ...(dto.storage_method !== undefined && { storage_method: dto.storage_method?.trim() || null }),
          ...(dto.ingredients !== undefined && { ingredients: dto.ingredients }),
          ...(dto.steps !== undefined && { steps: dto.steps }),
          ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        },
      },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await RecipeModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  async countTotal(store_id?: string): Promise<number> {
    const query: any = {};
    if (store_id) query.$or = [{ store_id }, { store_id: null }, { store_id: { $exists: false } }];
    return RecipeModel.countDocuments(query).exec();
  }

  async countByType(type: string, store_id?: string): Promise<number> {
    const query: any = { type };
    if (store_id) query.$or = [{ store_id }, { store_id: null }, { store_id: { $exists: false } }];
    return RecipeModel.countDocuments(query).exec();
  }

  /**
   * Khởi tạo dữ liệu mẫu nếu CSDL công thức đang trống
   */
  async seedInitialRecipes(): Promise<void> {
    const count = await this.countTotal();
    if (count > 0) return;

    const initialRecipes = [
      // ==========================================
      // NHÓM 1: BÁN THÀNH PHẨM / SƠ CHẾ NỘI BỘ (CHỈ NHÂN VIÊN THẤY)
      // ==========================================
      {
        name: 'Công Thức Nấu Nước Đường Nền',
        code: 'REC-NUOC-DUONG',
        type: 'internal_prep',
        category: 'Cốt trà & Syrup sơ chế',
        price: 0,
        estimated_cost: 26000,
        description: 'Nước đường nấu tỷ lệ chuẩn 1kg đường : 600ml nước, độ ngọt 65° Brix dùng chung cho toàn bộ quầy bar.',
        serving_size: '1.2 Lít',
        prep_time_minutes: 20,
        shelf_life: '15 ngày ở nhiệt độ phòng',
        storage_method: 'Bình thủy tinh sạch có vòi nhấn pump, để nơi thoáng mát',
        ingredients: [
          {
            material_name: 'Đường cát trắng Biên Hòa',
            quantity: 1,
            unit: 'Kg',
            cost: 22000,
            notes: 'Dùng đường tinh luyện không lẫn tạp chất',
          },
          {
            material_name: 'Nước lọc tinh khiết',
            quantity: 600,
            unit: 'ml',
            cost: 1000,
            notes: 'Nước đun sôi 100°C',
          },
        ],
        steps: [
          {
            step_number: 1,
            title: 'Đun sôi nước lọc',
            instruction: 'Đổ 600ml nước lọc tinh khiết vào nồi inox sạch, bật bếp đun sôi bùng.',
            duration_seconds: 300,
            tips: 'Dùng nồi inox dày đáy để tránh cháy khét đường',
          },
          {
            step_number: 2,
            title: 'Hòa tan đường cát',
            instruction: 'Hạ lửa nhỏ liu riu, đổ từ từ 1kg đường cát trắng vào nồi. Dùng muôi khuấy nhẹ nhàng theo 1 chiều đến khi đường tan hoàn toàn và nước trong veo.',
            duration_seconds: 420,
            tips: 'Không khuấy mạnh tạo bọt khí, chỉ khuấy 1 chiều tránh lại đường',
          },
          {
            step_number: 3,
            title: 'Làm nguội & Chiết vào bình pump',
            instruction: 'Tắt bếp, để nguội tự nhiên về nhiệt độ phòng. Chiết vào bình thủy tinh có vòi pump chuẩn 10ml/lần nhấn.',
            duration_seconds: 600,
            tips: 'Dán nhãn ngày nấu và HSD lên thân bình',
          },
        ],
      },
      {
        name: 'Công Thức Ủ Cốt Trà Đen Đậm Vị',
        code: 'REC-COT-TRA-DEN',
        type: 'internal_prep',
        category: 'Cốt trà & Syrup sơ chế',
        price: 0,
        estimated_cost: 18000,
        description: 'Cốt trà đen ủ nóng sốc nhiệt đá, màu đỏ nâu hổ phách, dùng làm nền cho Trà Dâu và Trà Sữa.',
        serving_size: '1 Lít',
        prep_time_minutes: 18,
        shelf_life: '4 - 6 giờ trong ca làm việc',
        storage_method: 'Bình giữ nhiệt chuyên dụng quầy bar, nhiệt độ phòng',
        ingredients: [
          {
            material_name: 'Trà đen Lộc Phát',
            quantity: 50,
            unit: 'g',
            cost: 8000,
            notes: 'Cân định lượng chính xác bằng cân tiểu ly điện tử',
          },
          {
            material_name: 'Nước sôi 95°C',
            quantity: 1200,
            unit: 'ml',
            cost: 1000,
            notes: 'Nhiệt độ nước chuẩn 93°C - 96°C',
          },
          {
            material_name: 'Đá viên làm lạnh sốc nhiệt',
            quantity: 200,
            unit: 'g',
            cost: 500,
            notes: 'Giúp khóa hương trà và giữ màu hổ phách',
          },
        ],
        steps: [
          {
            step_number: 1,
            title: 'Tráng ấm & Cân trà',
            instruction: 'Tráng bình ủ trà bằng nước sôi. Cân chính xác 50g trà đen cho vào túi lọc vải.',
            duration_seconds: 60,
            tips: 'Tráng nóng giúp nhiệt độ nước ủ không bị sụt giảm',
          },
          {
            step_number: 2,
            title: 'Ủ trà kín',
            instruction: 'Rót 1200ml nước sôi 95°C vào bình. Đậy nắp kín và ủ trong đúng 15 phút.',
            duration_seconds: 900,
            tips: 'Không ép hoặc vắt túi trà quá mạnh để tránh vị chát đắng gắt',
          },
          {
            step_number: 3,
            title: 'Lọc cốt & Sốc nhiệt',
            instruction: 'Nhấc túi bã trà ra, đổ ngay 200g đá viên sạch vào khuấy nhanh 10 giây để sốc nhiệt khóa hương.',
            duration_seconds: 60,
            tips: 'Cốt trà sau sốc nhiệt rót vào bình giữ nhiệt, không bảo quản tủ lạnh làm đục nước',
          },
        ],
      },
      {
        name: 'Công Thức Kem Cheese Macchiato Sánh Mịn',
        code: 'REC-KEM-CHEESE',
        type: 'internal_prep',
        category: 'Cốt trà & Syrup sơ chế',
        price: 0,
        estimated_cost: 28000,
        description: 'Lớp foam kem béo mặn sánh mịn, thơm ngậy phủ lên bề mặt trà trái cây hoặc cà phê muối.',
        serving_size: '400ml (Khoảng 8 ly)',
        prep_time_minutes: 5,
        shelf_life: '24 giờ trong ngăn mát tủ lạnh',
        storage_method: 'Ca đậy nắp kín trong ngăn mát 2 - 5°C',
        ingredients: [
          {
            material_name: 'Kem béo thực vật Rich’s Non-Dairy',
            quantity: 200,
            unit: 'ml',
            cost: 14000,
            notes: 'Phải rã đông hoàn toàn và thật lạnh trước khi đánh',
          },
          {
            material_name: 'Sữa tươi Dalat Milk không đường',
            quantity: 100,
            unit: 'ml',
            cost: 3400,
            notes: 'Sữa lạnh',
          },
          {
            material_name: 'Đường cát trắng Biên Hòa',
            quantity: 30,
            unit: 'g',
            cost: 700,
            notes: 'Hoặc 30ml nước đường nấu',
          },
          {
            material_name: 'Muối tinh sấy',
            quantity: 2,
            unit: 'g',
            cost: 100,
            notes: 'Tạo hậu vị mặn thanh cân bằng',
          },
        ],
        steps: [
          {
            step_number: 1,
            title: 'Phối trộn hỗn hợp sữa & kem',
            instruction: 'Cho 200ml kem Rich’s, 100ml sữa tươi, 30g đường và 2g muối vào ca đánh lạnh inox.',
            duration_seconds: 40,
            tips: 'Ca đánh lạnh giúp kem nhanh bông xốp hơn',
          },
          {
            step_number: 2,
            title: 'Đánh kem bằng máy tạo bọt',
            instruction: 'Dùng máy đánh bọt cầm tay ở tốc độ 2 trong 60 - 90 giây đến khi hỗn hợp sánh dẻo, có vân nhẹ.',
            duration_seconds: 90,
            tips: 'Không đánh quá cứng như kem bánh kem, foam macchiato cần độ chảy sóng sánh',
          },
        ],
      },

      // ==========================================
      // NHÓM 2: MÓN THƯƠNG PHẨM BÁN KHÁCH (CÔNG THỨC CHỈ NHÂN VIÊN THẤY)
      // ==========================================
      {
        name: 'Trà Dâu Tây Tươi Zone 6',
        code: 'REC-TRA-DAU',
        type: 'customer_product',
        category: 'Trà trái cây',
        price: 39000,
        estimated_cost: 9800,
        description: 'Món Best-Seller thanh mát từ cốt trà đen ủ thơm, mứt dâu tây miếng hòa quyện cùng vị chua nhẹ của tắc tươi.',
        image_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
        serving_size: 'Size L',
        prep_time_minutes: 3,
        shelf_life: 'Dùng ngay trong 30 phút sau khi pha',
        storage_method: 'Bảo quản có đá trong ly nắp kín',
        ingredients: [
          {
            material_name: 'Cốt Trà Đen Ủ (REC-COT-TRA-DEN)',
            quantity: 150,
            unit: 'ml',
            cost: 2700,
            notes: 'Cốt trà thơm đậm, còn ấm nhẹ hoặc nguội',
          },
          {
            material_name: 'Mứt Dâu Tây Berrino',
            quantity: 40,
            unit: 'g',
            cost: 3400,
            notes: 'Múc cả nước và miếng dâu',
          },
          {
            material_name: 'Siro Dâu Tây Golden Farm',
            quantity: 15,
            unit: 'ml',
            cost: 1800,
            notes: 'Tạo hương thơm và sắc hồng hấp dẫn',
          },
          {
            material_name: 'Nước Đường Nền (REC-NUOC-DUONG)',
            quantity: 25,
            unit: 'ml',
            cost: 550,
            notes: 'Khoảng 2.5 pump',
          },
          {
            material_name: 'Nước cốt quả tắc tươi',
            quantity: 10,
            unit: 'ml',
            cost: 500,
            notes: 'Vắt tươi bỏ hạt',
          },
          {
            material_name: 'Ly nhựa PP 700ml',
            quantity: 1,
            unit: 'Cái',
            cost: 550,
            notes: 'Ly size L in logo Zone 6',
          },
          {
            material_name: 'Nắp bằng phi 95',
            quantity: 1,
            unit: 'Cái',
            cost: 150,
            notes: 'Đậy chắc miệng ly',
          },
          {
            material_name: 'Ống hút phi 8 bọc màng',
            quantity: 1,
            unit: 'Cái',
            cost: 80,
            notes: 'Kèm theo ly',
          },
        ],
        steps: [
          {
            step_number: 1,
            title: 'Dầm mứt dâu & Cốt tắc',
            instruction: 'Cho 40g mứt dâu tây, 15ml siro dâu, 25ml nước đường và 10ml cốt tắc vào bình shaker. Dùng chày dầm nhẹ 5 lần cho mứt dâu dập nhẹ tỏa hương.',
            duration_seconds: 20,
            tips: 'Không dầm nát bét để khách hàng nhai được miếng dâu giòn dai',
          },
          {
            step_number: 2,
            title: 'Thêm cốt trà & Lắc đều',
            instruction: 'Rót 150ml cốt trà đen vào bình shaker. Xúc đầy đá viên đến vạch 650ml. Đậy nắp lắc mạnh và đều tay 12 - 15 lần.',
            duration_seconds: 25,
            tips: 'Lắc đều tay giúp trà lạnh sâu và tạo lớp bọt hồng mịn trên mặt',
          },
          {
            step_number: 3,
            title: 'Rót ly & Hoàn thiện món',
            instruction: 'Rót toàn bộ hỗn hợp ra ly nhựa 700ml. Thêm 1 lát cam sấy hoặc lá bạc hà trang trí (nếu có). Đóng nắp bằng, cắm ống hút phục vụ khách.',
            duration_seconds: 20,
            tips: 'Nếu khách mua mang đi, cho vào túi chữ T kèm 1 khăn giấy',
          },
        ],
      },
      {
        name: 'Cà Phê Muối Cố Đô Zone 6',
        code: 'REC-CA-PHE-MUOI',
        type: 'customer_product',
        category: 'Cà phê',
        price: 35000,
        estimated_cost: 8200,
        description: 'Vị cà phê pha phin truyền thống thơm đượm, hòa cùng sữa đặc ngọt béo và lớp kem muối mặn mà đặc trưng.',
        image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
        serving_size: 'Size M',
        prep_time_minutes: 2,
        shelf_life: 'Dùng ngay',
        storage_method: 'Nhiệt độ có đá',
        ingredients: [
          {
            material_name: 'Cốt Cà Phê Blend Zone 6',
            quantity: 50,
            unit: 'ml',
            cost: 3500,
            notes: 'Pha máy Espresso hoặc phin nhôm',
          },
          {
            material_name: 'Sữa đặc Ngôi Sao Phương Nam',
            quantity: 25,
            unit: 'ml',
            cost: 1400,
            notes: 'Rót dưới đáy ly',
          },
          {
            material_name: 'Kem Cheese / Muối (REC-KEM-CHEESE)',
            quantity: 50,
            unit: 'ml',
            cost: 2500,
            notes: 'Lớp kem béo mặn sánh mịn',
          },
          {
            material_name: 'Ly nhựa PP 500ml',
            quantity: 1,
            unit: 'Cái',
            cost: 450,
            notes: 'Ly size M',
          },
          {
            material_name: 'Nắp cầu phi 95',
            quantity: 1,
            unit: 'Cái',
            cost: 180,
            notes: 'Nắp vòm không làm xẹp lớp foam',
          },
          {
            material_name: 'Ống hút phi 8 bọc màng',
            quantity: 1,
            unit: 'Cái',
            cost: 80,
            notes: 'Cắm kèm ly',
          },
        ],
        steps: [
          {
            step_number: 1,
            title: 'Đáy sữa đặc & Cà phê',
            instruction: 'Cho 25ml sữa đặc vào đáy ly 500ml. Rót 50ml cốt cà phê còn ấm vào, dùng que khuấy đều cho sữa và cà phê quyện vào nhau.',
            duration_seconds: 20,
            tips: 'Khuấy đều khi cà phê ấm giúp sữa tan hoàn toàn',
          },
          {
            step_number: 2,
            title: 'Thêm đá viên',
            instruction: 'Xúc đá bi hoặc đá viên đầy cách miệng ly khoảng 2.5cm.',
            duration_seconds: 10,
            tips: 'Chừa khoảng trống 2.5cm để rót lớp kem muối',
          },
          {
            step_number: 3,
            title: 'Rót lớp kem muối Macchiato',
            instruction: 'Lấy ca kem muối (REC-KEM-CHEESE) rót nhẹ nhàng 50ml kem béo muối phủ kín bề mặt. Rắc 1 ít bột cacao nhẹ trang trí. Đóng nắp cầu.',
            duration_seconds: 20,
            tips: 'Nhắc khách có thể uống trực tiếp từ miệng ly để thưởng thức lớp kem trước hoặc khuấy đều',
          },
        ],
      },
      {
        name: 'Trà Đào Cam Sả Tươi',
        code: 'REC-TRA-DAO-CAM-SA',
        type: 'customer_product',
        category: 'Trà trái cây',
        price: 42000,
        estimated_cost: 10500,
        description: 'Vị thanh ngọt của đào ngâm kết hợp cùng nước cam mọng nước và hương sả nồng ấm thanh lọc cơ thể.',
        image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
        serving_size: 'Size L',
        prep_time_minutes: 3,
        shelf_life: 'Dùng ngay',
        storage_method: 'Nhiệt độ có đá',
        ingredients: [
          {
            material_name: 'Trà sen Bảo Lộc (Cốt trà)',
            quantity: 140,
            unit: 'ml',
            cost: 2900,
            notes: 'Hương sen dịu nhẹ',
          },
          {
            material_name: 'Nước cam tươi',
            quantity: 30,
            unit: 'ml',
            cost: 1500,
            notes: 'Cam sành tươi vắt lấy nước',
          },
          {
            material_name: 'Nước Đường Nền (REC-NUOC-DUONG)',
            quantity: 30,
            unit: 'ml',
            cost: 650,
            notes: '3 pump nước đường',
          },
          {
            material_name: 'Sả tươi đập dập',
            quantity: 1,
            unit: 'Cây',
            cost: 1000,
            notes: 'Cắt khúc đập dập thơm lừng',
          },
          {
            material_name: 'Đào ngâm miếng',
            quantity: 2,
            unit: 'Miếng',
            cost: 3500,
            notes: 'Đào ngâm giòn',
          },
          {
            material_name: 'Ly nhựa PP 700ml + Nắp + Ống hút',
            quantity: 1,
            unit: 'Bộ',
            cost: 780,
            notes: 'Bộ bao bì size L',
          },
        ],
        steps: [
          {
            step_number: 1,
            title: 'Dập sả lấy tinh dầu',
            instruction: 'Cho khúc sả đập dập vào đáy bình shaker, thêm 30ml nước đường, dùng chày dầm mạnh 5 lần cho tinh dầu sả tiết ra.',
            duration_seconds: 20,
            tips: 'Dập sả giúp trà dậy mùi thơm đặc trưng tự nhiên',
          },
          {
            step_number: 2,
            title: 'Hòa quyện cốt trà & Cam tươi',
            instruction: 'Thêm 140ml cốt trà sen và 30ml nước cam tươi vào bình. Thêm đầy đá viên và lắc mạnh 15 lần.',
            duration_seconds: 25,
            tips: 'Không nấu nước cam với trà nóng để tránh bị đắng vỏ',
          },
          {
            step_number: 3,
            title: 'Trang trí miếng đào & Phục vụ',
            instruction: 'Đổ ra ly 700ml, gắp 2 miếng đào ngâm giòn đặt lên trên mặt đá. Đóng nắp kèm ống hút và muỗng xúc đào.',
            duration_seconds: 25,
            tips: 'Kèm theo muỗng nhỏ để khách múc đào ăn',
          },
        ],
      },
    ];

    await RecipeModel.insertMany(initialRecipes);
  }
}
