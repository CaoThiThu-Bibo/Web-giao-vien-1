import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from Vite environment
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://gtwmtexqygqshjanxvyb.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lQDO7Hz33QUj8LSgS4miWg_G5G3RqAr';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your-project-id') &&
  !SUPABASE_ANON_KEY.includes('your-anon-key')
);

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseSyncStatus {
  connected: boolean;
  message: string;
  lastChecked: string;
}

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection(): Promise<SupabaseSyncStatus> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Chưa cấu hình URL hoặc Anon Key của Supabase.',
      lastChecked: new Date().toLocaleTimeString('vi-VN'),
    };
  }

  try {
    // Try pinging users or classes table
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      // If error indicates table doesn't exist yet
      if (error.code === '42P01' || error.message?.includes('relation "public.users" does not exist')) {
        return {
          connected: true,
          message: 'Đã kết nối Supabase thành công! (Lưu ý: Bảng "users" chưa được tạo, vui lòng chạy đoạn mã SQL trong Supabase SQL Editor).',
          lastChecked: new Date().toLocaleTimeString('vi-VN'),
        };
      }
      return {
        connected: false,
        message: `Lỗi kết nối Supabase: ${error.message}`,
        lastChecked: new Date().toLocaleTimeString('vi-VN'),
      };
    }

    return {
      connected: true,
      message: 'Kết nối Supabase hoạt động tốt và sẵn sàng lưu trữ dữ liệu!',
      lastChecked: new Date().toLocaleTimeString('vi-VN'),
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Không thể kết nối đến Supabase: ${err?.message || 'Lỗi mạng'}`,
      lastChecked: new Date().toLocaleTimeString('vi-VN'),
    };
  }
}
