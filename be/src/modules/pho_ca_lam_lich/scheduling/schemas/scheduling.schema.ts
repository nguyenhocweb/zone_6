import { z } from 'zod';

export const StaffRegistrationInputSchema = z.object({
  stt: z.number().int().default(1),
  name: z.string().min(1, 'Tên nhân viên không được để trống'),
  mon: z.string().default(''),
  tue: z.string().default(''),
  wed: z.string().default(''),
  thu: z.string().default(''),
  fri: z.string().default(''),
  sat: z.string().default(''),
  sun: z.string().default(''),
});

export const SchedulingConfigRequestSchema = z.object({
  evening_shift_mode: z.union([z.literal(1), z.literal(2)]).default(2),
  max_shifts_per_day: z.number().int().min(1).max(2).default(1),
  registrations: z.array(StaffRegistrationInputSchema),
  start_date: z.string().nullable().optional(),
});

export const SlotAssignmentSchema = z.object({
  day: z.string(),
  shift: z.string(),
  role: z.string(),
  staff_name: z.string().nullable().optional(),
  is_empty: z.boolean().default(false),
  is_disabled: z.boolean().default(false),
  is_leader: z.boolean().default(false),
  is_checked_in: z.boolean().default(false).optional(),
});

export const CheckInSlotRequestSchema = z.object({
  week_start_date: z.string().min(1, 'Thiếu week_start_date'),
  day: z.string().min(1, 'Thiếu day'),
  shift: z.string().min(1, 'Thiếu shift'),
  role: z.string().min(1, 'Thiếu role'),
  is_checked_in: z.boolean().optional(),
  slots: z.array(SlotAssignmentSchema).optional(),
  week_range: z.string().optional(),
  evening_shift_mode: z.number().optional(),
});

export const StaffWorkloadSummarySchema = z.object({
  name: z.string(),
  target_shifts: z.number().default(0),
  assigned_shifts: z.number().default(0),
  status: z.enum(['Đủ', 'Thiếu', 'Vượt']).default('Đủ'),
});

export const ScheduleMatrixResponseSchema = z.object({
  success: z.boolean().default(true),
  week_range: z.string().default('Tuần Zone Six 214 LNH'),
  start_date: z.string().nullable().optional(),
  day_dates: z.record(z.string()).default({}),
  evening_shift_mode: z.number(),
  slots: z.array(SlotAssignmentSchema),
  workloads: z.array(StaffWorkloadSummarySchema),
  registrations: z.array(StaffRegistrationInputSchema).default([]),
  total_slots_needed: z.number(),
  total_slots_filled: z.number(),
  total_empty_slots: z.number(),
});

export type StaffRegistrationInput = z.infer<typeof StaffRegistrationInputSchema>;
export type SchedulingConfigRequest = z.infer<typeof SchedulingConfigRequestSchema>;
export type SlotAssignment = z.infer<typeof SlotAssignmentSchema>;
export type StaffWorkloadSummary = z.infer<typeof StaffWorkloadSummarySchema>;
export type ScheduleMatrixResponse = z.infer<typeof ScheduleMatrixResponseSchema>;
export type CheckInSlotRequest = z.infer<typeof CheckInSlotRequestSchema>;
