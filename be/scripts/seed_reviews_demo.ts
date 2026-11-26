import 'dotenv/config';
import mongoose from 'mongoose';
import { StoreConfigModel } from '../src/modules/admin_he_thong/store-config/models/store-config.model.js';
import { UserModel } from '../src/modules/quan_ly/staff/models/user.model.js';
import { StoreReviewModel } from '../src/modules/reviews/models/store-review.model.js';

const DEMO_REVIEWS = [
  { name: 'Minh Anh', email: 'minhanh.dn01@gmail.com', mask: 'mi***@gmail.com', rating: 5, tags: ['Không gian yên tĩnh', 'Đồ uống ngon'], comment: 'Cà phê muối cố đô đậm vị, lớp kem béo mịn rất vừa miệng. Ngồi làm việc cả buổi chiều cực kỳ thoải mái.' },
  { name: 'Người Ẩn Danh', email: 'anon.review02@gmail.com', mask: 'an***@gmail.com', rating: 5, tags: ['Wifi ổn định', 'Nhạc nhẹ nhàng'], comment: 'Quán mở nhạc acoustic nhẹ nhàng, wifi mạnh, ổ cắm điện bố trí tiện ở mọi bàn.' },
  { name: 'Hoàng Long', email: 'hoanglong.98@gmail.com', mask: 'ho***@gmail.com', rating: 4, tags: ['Đồ uống ngon', 'Giá hợp lý'], comment: 'Trà dâu tây tươi uống thanh mát, giá ổn so với mặt bằng trung tâm. Cuối tuần hơi đông một chút.' },
  { name: 'Thu Thảo', email: 'thuthao.le@gmail.com', mask: 'th***@gmail.com', rating: 5, tags: ['Phục vụ nhiệt tình', 'Không gian yên tĩnh'], comment: 'Các bạn nhân viên dễ thương, tư vấn đồ uống nhiệt tình. Mình rất thích ánh sáng vàng ấm của quán.' },
  { name: 'Quốc Bảo', email: 'quocbao.dev@gmail.com', mask: 'qu***@gmail.com', rating: 3, tags: ['Wifi ổn định'], comment: 'Không gian ổn để chạy deadline nhưng hôm nay mình gọi trà đào hơi ngọt so với khẩu vị.' },
  { name: 'Người Ẩn Danh', email: 'anon.review06@gmail.com', mask: 'an***@gmail.com', rating: 5, tags: ['Đồ uống ngon', 'Phục vụ nhiệt tình'], comment: 'Lần đầu ghé Zone Six mà ấn tượng thật sự, từ cách đóng gói đến hương vị đều chỉnh chu.' },
  { name: 'Ngọc Hân', email: 'ngochan.tran@gmail.com', mask: 'ng***@gmail.com', rating: 4, tags: ['Không gian yên tĩnh', 'Nhạc nhẹ nhàng'], comment: 'Góc ban công tầng trên rất chill vào buổi tối, thích hợp đi cùng bạn bè tâm sự.' },
  { name: 'Đức Thịnh', email: 'ducthinh.photo@gmail.com', mask: 'du***@gmail.com', rating: 2, tags: ['Giá hợp lý'], comment: 'Hôm mình ghé giờ cao điểm nên chờ nước hơi lâu tầm 15 phút, mong quán cải thiện tốc độ ra món.' },
  { name: 'Phương Linh', email: 'phuonglinh.09@gmail.com', mask: 'ph***@gmail.com', rating: 5, tags: ['Đồ uống ngon', 'Không gian yên tĩnh'], comment: 'Trà đào cam sả thơm mùi sả tươi, miếng đào giòn ngon. Sẽ quay lại ủng hộ dài lâu.' },
  { name: 'Người Ẩn Danh', email: 'anon.review10@gmail.com', mask: 'an***@gmail.com', rating: 4, tags: ['Phục vụ nhiệt tình', 'Wifi ổn định'], comment: 'Quán sạch sẽ, nhà vệ sinh thơm tho, nhân viên dọn bàn rất nhanh.' },
  { name: 'Tuấn Kiệt', email: 'tuankiet.arch@gmail.com', mask: 'tu***@gmail.com', rating: 5, tags: ['Không gian yên tĩnh', 'Nhạc nhẹ nhàng'], comment: 'Thiết kế nội thất gỗ mộc rất có gu, chụp ảnh góc nào cũng đẹp tự nhiên.' },
  { name: 'Khánh Vy', email: 'khanhvy.2k@gmail.com', mask: 'kh***@gmail.com', rating: 1, tags: [], comment: 'Hôm qua bạn mình lỡ làm đổ nước nhưng nhân viên hơi chậm hỗ trợ khăn lau, cần chú ý thái độ phục vụ hơn.' },
  { name: 'Hải Đăng', email: 'haidang.dn@gmail.com', mask: 'ha***@gmail.com', rating: 5, tags: ['Đồ uống ngon', 'Giá hợp lý'], comment: 'Uống thử bạc xỉu và thêm trân châu đen hoàng kim rất hợp vị, giá sinh viên hợp lý.' },
  { name: 'Người Ẩn Danh', email: 'anon.review14@gmail.com', mask: 'an***@gmail.com', rating: 4, tags: ['Không gian yên tĩnh'], comment: 'Buổi sáng ngồi nhâm nhi cà phê đọc sách ở đây rất yên bình.' },
  { name: 'Thanh Tùng', email: 'thanhtung.mkt@gmail.com', mask: 'th***@gmail.com', rating: 3, tags: ['Giá hợp lý', 'Wifi ổn định'], comment: 'Mọi thứ đều ổn áp, chỉ góp ý nhỏ là chỗ để xe buổi tối hơi chật một chút.' },
  { name: 'Lan Phương', email: 'lanphuong.95@gmail.com', mask: 'la***@gmail.com', rating: 5, tags: ['Phục vụ nhiệt tình', 'Đồ uống ngon'], comment: 'Đặt món bằng mã QR ngay tại bàn cực nhanh, thanh toán VietQR xong là có nước ngay.' },
  { name: 'Người Ẩn Danh', email: 'anon.review17@gmail.com', mask: 'an***@gmail.com', rating: 5, tags: ['Không gian yên tĩnh', 'Wifi ổn định'], comment: 'Quán ruột của nhóm tụi mình mỗi mùa ôn thi, không gian thoáng và mát.' },
  { name: 'Gia Huy', email: 'giahuy.design@gmail.com', mask: 'gi***@gmail.com', rating: 4, tags: ['Nhạc nhẹ nhàng', 'Đồ uống ngon'], comment: 'Playlist nhạc cực kỳ hợp gu, cà phê rang vừa không bị gắt.' },
  { name: 'Mai Chi', email: 'maichi.03@gmail.com', mask: 'ma***@gmail.com', rating: 2, tags: ['Không gian yên tĩnh'], comment: 'Bàn gần cửa ra vào hơi nóng vào buổi trưa, hy vọng quán chỉnh điều hòa mát hơn.' },
  { name: 'Người Ẩn Danh', email: 'anon.review20@gmail.com', mask: 'an***@gmail.com', rating: 5, tags: ['Đồ uống ngon', 'Phục vụ nhiệt tình'], comment: 'Topping thạch củ năng giòn sần sật, kết hợp với trà trái cây rất cuốn.' },
  { name: 'Văn Hùng', email: 'vanhung.it@gmail.com', mask: 'va***@gmail.com', rating: 4, tags: ['Wifi ổn định', 'Giá hợp lý'], comment: 'Ngồi họp team 4 người rất ổn, không bị ồn ào như nhiều quán khác.' },
  { name: 'Bích Ngọc', email: 'bichngoc.99@gmail.com', mask: 'bi***@gmail.com', rating: 5, tags: ['Không gian yên tĩnh', 'Phục vụ nhiệt tình'], comment: 'Mình quên sạc laptop ở quán mà các bạn nhân viên giữ giùm rất cẩn thận, cảm ơn quán nhiều!' },
  { name: 'Người Ẩn Danh', email: 'anon.review23@gmail.com', mask: 'an***@gmail.com', rating: 3, tags: ['Đồ uống ngon'], comment: 'Đồ uống ngon nhưng menu bánh ngọt hơi ít lựa chọn, mong quán bổ sung thêm.' },
  { name: 'Trọng Nghĩa', email: 'trongnghia.88@gmail.com', mask: 'tr***@gmail.com', rating: 5, tags: ['Giá hợp lý', 'Đồ uống ngon'], comment: 'Chất lượng ổn định qua nhiều lần ghé thăm, xứng đáng 5 sao.' },
  { name: 'Thùy Dương', email: 'thuyduong.hr@gmail.com', mask: 'th***@gmail.com', rating: 4, tags: ['Không gian yên tĩnh', 'Nhạc nhẹ nhàng'], comment: 'Không gian ấm cúng, nhân viên thân thiện, sẽ giới thiệu cho đồng nghiệp.' },
];

const DEMO_REPLIES = [
  'Zone Six chân thành cảm ơn bạn đã yêu thích hương vị cà phê muối cố đô và không gian của quán. Hẹn sớm gặp lại bạn!',
  'Cảm ơn bạn đã dành lời khen cho hệ thống wifi và âm nhạc tại quán. Chúc bạn có nhiều giờ làm việc hiệu quả!',
  'Cảm ơn góp ý của bạn! Quán đã ghi nhận phản hồi về độ ngọt và sẽ điều chỉnh định lượng phù hợp hơn cho bạn vào lần tới.',
  'Rất xin lỗi bạn vì trải nghiệm chờ nước hơi lâu vào khung giờ cao điểm. Quản lý chi nhánh đã bố trí thêm nhân sự quầy pha chế để phục vụ nhanh hơn.',
  'Zone Six cảm ơn bạn rất nhiều vì đã trải nghiệm đặt món QR tại bàn và để lại đánh giá 5 sao!',
  'Cảm ơn bạn đã góp ý về khu vực giữ xe buổi tối. Quán đang mở rộng thêm vị trí đỗ xe để khách hàng thuận tiện hơn ạ.',
  'Zone Six thành thật xin lỗi bạn về sự cố phục vụ chậm trễ vừa qua. Quản lý đã nhắc nhở và đào tạo lại đội ngũ trực ca ngay lập tức.',
  'Rất vui được hỗ trợ bạn giữ lại đồ cá nhân an toàn. Zone Six luôn trân trọng sự tin tưởng của bạn!',
  'Cảm ơn góp ý quý giá của bạn về nhiệt độ điều hòa buổi trưa, chi nhánh đã kiểm tra và điều chỉnh lại luồng gió ngay hôm nay.',
  'Cảm ơn bạn đã luôn đồng hành cùng Zone Six trong mỗi mùa ôn thi. Chúc bạn đạt kết quả thật tốt!',
  'Zone Six đã ghi nhận đề xuất bổ sung thêm dòng bánh ngọt ăn kèm. Hy vọng bạn sẽ bất ngờ ở lần ghé tiếp theo nhé!',
  'Cảm ơn bạn đã tin yêu và ủng hộ chất lượng đồ uống của Zone Six suốt thời gian qua!',
  'Rất hân hạnh được đón tiếp bạn và đồng nghiệp tại Zone Six trong những buổi gặp mặt sắp tới!',
];

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('Thiếu DATABASE_URL trong .env');

  await mongoose.connect(dbUrl);
  console.log('✅ Đã kết nối MongoDB Atlas.');

  const stores = await StoreConfigModel.find({ is_active: true }).exec();
  if (stores.length === 0) throw new Error('Không tìm thấy chi nhánh nào đang hoạt động.');

  const adminUser = await UserModel.findOne({ role: 'admin_he_thong' }).exec();
  const managerUser = await UserModel.findOne({ role: 'quan_ly' }).exec();

  const replierActors = [
    {
      id: adminUser?._id || new mongoose.Types.ObjectId(),
      name: adminUser?.full_name || 'Admin Hệ Thống',
    },
    {
      id: managerUser?._id || adminUser?._id || new mongoose.Types.ObjectId(),
      name: managerUser?.full_name || 'Quản Lý Chi Nhánh',
    },
  ];

  // Chỉ chọn 13 chỉ số đánh giá để gắn phản hồi (ưu tiên cả các đánh giá 1-3 sao và 5 sao)
  const replyIndices = new Set([0, 1, 3, 4, 7, 11, 14, 15, 16, 18, 21, 22, 23]);
  let replyCursor = 0;

  for (let i = 0; i < DEMO_REVIEWS.length; i++) {
    const item = DEMO_REVIEWS[i];
    const store = stores[i % stores.length];
    const createdAt = new Date(Date.now() - (DEMO_REVIEWS.length - i) * 6 * 60 * 60 * 1000);

    const hasReply = replyIndices.has(i);
    const actor = replierActors[replyCursor % replierActors.length];
    const replyText = hasReply ? DEMO_REPLIES[replyCursor++] : undefined;

    await StoreReviewModel.findOneAndUpdate(
      { store_id: store._id, canonical_email: item.email },
      {
        $set: {
          store_id: store._id,
          store_name: store.store_name,
          reviewer_name: item.name,
          email_masked: item.mask,
          canonical_email: item.email,
          rating: item.rating,
          tags: item.tags,
          comment: item.comment,
          images: [],
          status: 'PUBLISHED',
          ...(hasReply
            ? {
                owner_reply: replyText,
                replied_by_id: actor.id,
                replied_by_name: actor.name,
                replied_at: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
              }
            : {}),
          created_at: createdAt,
          updated_at: createdAt,
        },
      },
      { upsert: true, new: true }
    ).exec();
  }

  console.log(`🎉 Đã seed thành công ${DEMO_REVIEWS.length} đánh giá khách hàng và ${replyCursor} phản hồi từ Admin/Quản Lý!`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌ Lỗi seed reviews:', err);
  process.exit(1);
});
