import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'new_order' | 'order_update';
  orderId: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const useOrderNotifications = (userRole: 'vendor' | 'delivery' | null) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get vendor or delivery partner ID
  const { data: partnerData } = useQuery({
    queryKey: ['partner-data', user?.id, userRole],
    queryFn: async () => {
      if (!user || !userRole) return null;

      if (userRole === 'vendor') {
        const { data, error } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        return data ? { id: data.id, type: 'vendor' as const } : null;
      } else if (userRole === 'delivery') {
        const { data, error } = await supabase
          .from('delivery_partners')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        return data ? { id: data.id, type: 'delivery' as const } : null;
      }
      return null;
    },
    enabled: !!user && !!userRole,
  });

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!user || !userRole || !partnerData) return;

    let channel: any;

    if (userRole === 'vendor') {
      // Subscribe to delivery_requests for this vendor
      channel = supabase
        .channel(`vendor-orders-${partnerData.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'delivery_requests',
            filter: `vendor_id=eq.${partnerData.id}`,
          },
          (payload) => {
            const newOrder = payload.new as any;
            const notification: Notification = {
              id: `notif-${Date.now()}`,
              type: 'new_order',
              orderId: newOrder.order_id,
              message: `New order received! Order #${newOrder.order_id.slice(0, 8)}`,
              timestamp: new Date(),
              read: false,
            };
            
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New Order Received', {
                body: notification.message,
                icon: '/logo.png',
                tag: newOrder.order_id,
              });
            }
            
            toast.success(notification.message, {
              action: {
                label: 'View',
                onClick: () => window.location.href = '/vendor/dashboard',
              },
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'delivery_requests',
            filter: `vendor_id=eq.${partnerData.id}`,
          },
          (payload) => {
            const updated = payload.new as any;
            if (updated.status === 'approved' || updated.status === 'rejected') {
              const notification: Notification = {
                id: `notif-${Date.now()}`,
                type: 'order_update',
                orderId: updated.order_id,
                message: `Order #${updated.order_id.slice(0, 8)} status updated: ${updated.status}`,
                timestamp: new Date(),
                read: false,
              };
              
              setNotifications(prev => [notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .subscribe();
    } else if (userRole === 'delivery') {
      // Subscribe to delivery_requests assigned to this delivery partner
      channel = supabase
        .channel(`delivery-orders-${partnerData.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'delivery_requests',
            filter: `assigned_partner_id=eq.${partnerData.id}`,
          },
          (payload) => {
            const updated = payload.new as any;
            if (updated.status === 'assigned') {
              const notification: Notification = {
                id: `notif-${Date.now()}`,
                type: 'new_order',
                orderId: updated.order_id,
                message: `New delivery assigned! Order #${updated.order_id.slice(0, 8)}`,
                timestamp: new Date(),
                read: false,
              };
              
              setNotifications(prev => [notification, ...prev]);
              setUnreadCount(prev => prev + 1);
              
              // Show browser notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Delivery Assigned', {
                  body: notification.message,
                  icon: '/logo.png',
                  tag: updated.order_id,
                });
              }
              
              toast.success(notification.message, {
                action: {
                  label: 'View',
                  onClick: () => window.location.href = '/delivery/dashboard',
                },
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `delivery_partner_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              const order = payload.new as any;
              const notification: Notification = {
                id: `notif-${Date.now()}`,
                type: 'order_update',
                orderId: order.id,
                message: `Order #${order.id.slice(0, 8)} status: ${order.delivery_status}`,
                timestamp: new Date(),
                read: false,
              };
              
              setNotifications(prev => [notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, userRole, partnerData]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};

