import { z } from 'zod';

export const SendTextMessageSchema = z.object({
  threadId: z.string().optional(),
  recipientId: z.string().optional(),
  text: z.string().optional(),
  content: z.string().optional(),
  isGroup: z.boolean().optional(),
  threadType: z.enum(['group', 'user']).optional(),
}).transform((data) => {
  const threadId = data.threadId || data.recipientId;
  const text = data.text || data.content;
  const isGroup = typeof data.isGroup === 'boolean'
    ? data.isGroup
    : (data.threadType ? data.threadType === 'group' : true);

  if (!threadId?.trim()) {
    throw new Error('ID người nhận hoặc ID nhóm (threadId / recipientId) không được để trống');
  }
  if (!text?.trim()) {
    throw new Error('Nội dung tin nhắn (text / content) không được để trống');
  }

  // Tự động làm sạch threadId nếu người dùng dán vào _g8974..., g8974..., _8974...
  const cleanThreadId = threadId.trim().replace(/^[_gG]+/, '');

  return {
    threadId: cleanThreadId,
    text: text.trim(),
    isGroup,
  };
});

export const SendImageMessageSchema = z.object({
  threadId: z.string().optional(),
  recipientId: z.string().optional(),
  imagePath: z.string().optional(),
  imageUrl: z.string().optional(),
  caption: z.string().max(2000, 'Caption tối đa 2000 ký tự').optional(),
  isGroup: z.boolean().optional(),
  threadType: z.enum(['group', 'user']).optional(),
}).transform((data) => {
  const threadId = data.threadId || data.recipientId;
  const imagePath = data.imagePath || data.imageUrl;
  const isGroup = typeof data.isGroup === 'boolean'
    ? data.isGroup
    : (data.threadType ? data.threadType === 'group' : true);

  if (!threadId?.trim()) {
    throw new Error('ID người nhận hoặc ID nhóm không được để trống');
  }
  if (!imagePath?.trim()) {
    throw new Error('Đường dẫn ảnh (imagePath / imageUrl) không được để trống');
  }

  const cleanThreadId = threadId.trim().replace(/^[_gG]+/, '');

  return {
    threadId: cleanThreadId,
    imagePath: imagePath.trim(),
    caption: data.caption?.trim(),
    isGroup,
  };
});

export const QrIdParamSchema = z.object({
  id: z.string().uuid('ID phiên QR phải có định dạng UUID hợp lệ'),
});

export const ZaloChannelTypeSchema = z.enum(['CHECKIN', 'MATERIAL', 'SCHEDULE', 'GENERAL']);
export type ZaloChannelType = z.infer<typeof ZaloChannelTypeSchema>;

export const SingleChannelConfigSchema = z.object({
  storeId: z.string().optional().nullable(),
  channelType: ZaloChannelTypeSchema.default('GENERAL'),
  threadType: z.enum(['group', 'user']).default('group'),
  targetId: z.string().default(''),
  targetName: z.string().optional(),
  groupName: z.string().optional(),
  imageUrl: z.string().optional().default(''),
  defaultMessage: z.string().optional(),
  isActive: z.boolean().default(true),
}).transform((data) => ({
  storeId: data.storeId?.trim() || null,
  channelType: data.channelType,
  threadType: data.threadType,
  targetId: data.targetId.trim().replace(/^[_gG]+/, ''),
  targetName: data.targetName?.trim(),
  groupName: data.groupName?.trim(),
  imageUrl: data.imageUrl?.trim() || '',
  defaultMessage: data.defaultMessage?.trim(),
  isActive: data.isActive,
}));

export const UpdateStoreZaloChannelsSchema = z.object({
  storeId: z.string().optional().nullable(),
  channels: z.array(SingleChannelConfigSchema),
});

export const TestChannelMessageSchema = z.object({
  storeId: z.string().optional().nullable(),
  channelType: ZaloChannelTypeSchema,
  message: z.string().optional(),
});

export const UpdateZaloConfigSchema = z.object({
  storeId: z.string().optional().nullable(),
  channelType: ZaloChannelTypeSchema.optional().default('GENERAL'),
  threadType: z.enum(['group', 'user']).default('group'),
  targetId: z.string().default(''),
  targetName: z.string().optional(),
  groupName: z.string().optional(),
  imageUrl: z.string().optional().default(''),
  defaultMessage: z.string().optional(),
  isActive: z.boolean().optional().default(true),
}).transform((data) => ({
  storeId: data.storeId?.trim() || null,
  channelType: data.channelType,
  threadType: data.threadType,
  targetId: data.targetId.trim().replace(/^[_gG]+/, ''),
  targetName: data.targetName?.trim(),
  groupName: data.groupName?.trim(),
  imageUrl: data.imageUrl?.trim() || '',
  defaultMessage: data.defaultMessage?.trim(),
  isActive: data.isActive,
}));

export interface ZaloConfigResponse {
  id: string;
  storeId?: string | null;
  channelType: ZaloChannelType;
  threadType: 'group' | 'user';
  targetId: string;
  targetName: string;
  groupName: string;
  imageUrl: string;
  defaultMessage: string;
  isActive: boolean;
  lastSentAt?: Date | null;
  updatedAt: Date;
}

export type SendTextMessageDto = z.infer<typeof SendTextMessageSchema>;
export type SendImageMessageDto = z.infer<typeof SendImageMessageSchema>;
export type UpdateZaloConfigDto = z.infer<typeof UpdateZaloConfigSchema>;
export type SingleChannelConfigDto = z.infer<typeof SingleChannelConfigSchema>;
export type UpdateStoreZaloChannelsDto = z.infer<typeof UpdateStoreZaloChannelsSchema>;
export type TestChannelMessageDto = z.infer<typeof TestChannelMessageSchema>;


