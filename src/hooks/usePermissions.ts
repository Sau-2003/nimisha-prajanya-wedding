import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/admin';

export function usePermissions() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [canViewBudget, setCanViewBudget] = useState(false);
  const [canViewPrivate, setCanViewPrivate] = useState(false); // <-- NEW
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        setLoading(false);
        return;
      }

      // 1. Admins get everything automatically
      if (ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        setCanViewBudget(true);
        setCanViewPrivate(true); 
        setLoading(false);
        return;
      }

      // 2. Check Database for specific permissions
      const { data } = await supabase
        .from('user_roles')
        .select('can_view_budget, can_view_private') // <-- NEW
        .eq('email', user.email)
        .single();

      if (data) {
        if (data.can_view_budget) setCanViewBudget(true);
        if (data.can_view_private) setCanViewPrivate(true); // <-- NEW
      }
      
      setLoading(false);
    }

    checkAccess();
  }, []);

  return { isAdmin, canViewBudget, canViewPrivate, loading };
}