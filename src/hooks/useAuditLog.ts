import { supabase } from '@/integrations/supabase/client';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type AuditTable = 'jobs' | 'articles' | 'myths';

export const useAuditLog = () => {
  const logAction = async (
    action: AuditAction,
    tableName: AuditTable,
    recordId?: string,
    oldValues?: any,
    newValues?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found for audit log');
        return;
      }

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          action,
          table_name: tableName,
          record_id: recordId,
          old_values: oldValues || null,
          new_values: newValues || null,
        });

      if (error) {
        console.error('Failed to create audit log:', error);
      }
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  return { logAction };
};
