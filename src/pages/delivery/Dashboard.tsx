import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Auth from '@/pages/Auth';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Package, Check, X, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { buildMapsDirectionUrl, getCurrentPosition, openGoogleMaps, startPositionWatch } from '@/lib/utils';
import { STATUS_LABEL } from '@/lib/orderStatus';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { NotificationBell } from '@/components/NotificationBell';

const DeliveryDashboard = () => {
  const { user, userRoles, loading } = useAuth();
  const notifications = useOrderNotifications(userRoles.includes('delivery') ? 'delivery' : null);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><span className="text-sm text-muted-foreground">Loading…</span></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Delivery Dashboard</h1>
          {userRoles.includes('delivery') && (
            <NotificationBell
              notifications={notifications.notifications}
              unreadCount={notifications.unreadCount}
              onMarkAsRead={notifications.markAsRead}
              onMarkAllAsRead={notifications.markAllAsRead}
              onClear={notifications.clearNotifications}
            />
          )}
        </div>

        {!user ? (
          <div className="max-w-xl">
            <Auth />
          </div>
        ) : !userRoles.includes('delivery') ? (
          <div className="max-w-xl p-6 border rounded-md">
            <p className="text-sm text-muted-foreground mb-4">Your account does not have the delivery partner role.</p>
            <div className="flex gap-2">
              <a href="/delivery/register" className="px-3 py-2 border rounded text-sm">Apply as Delivery Partner</a>
              <a href="/" className="px-3 py-2 border rounded text-sm">Go Home</a>
            </div>
          </div>
        ) : (
          <>
            <DeliveryPartnerLocationCard />
            <div className="h-4" />
            <AssignedRequests />
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;

const DeliveryPartnerLocationCard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: partner, isLoading } = useQuery({
    queryKey: ['delivery-partner-location', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('delivery_partners')
        .select('id, latitude, longitude')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; latitude: number | null; longitude: number | null } | null;
    },
  });

  const setLocation = useMutation({
    mutationFn: async () => {
      if (!partner?.id) throw new Error('Partner profile not found');
      const pos = await getCurrentPosition();
      if (!pos) throw new Error('Unable to get current location');

      // Update delivery partner location
      const { error } = await (supabase as any)
        .from('delivery_partners')
        .update({ latitude: pos.lat, longitude: pos.lon })
        .eq('id', partner.id);
      if (error) throw error;

      // Also update tracking for any active deliveries
      const { data: activeDeliveries } = await (supabase as any)
        .from('delivery_requests')
        .select('order_id')
        .eq('assigned_partner_id', partner.id)
        .in('status', ['accepted', 'picked_up', 'out_for_delivery']);

      if (activeDeliveries && activeDeliveries.length > 0) {
        const trackingInserts = activeDeliveries.map((delivery: any) => ({
          order_id: delivery.order_id,
          partner_id: partner.id,
          latitude: pos.lat,
          longitude: pos.lon,
        }));

        const { error: trackingError } = await (supabase as any)
          .from('delivery_tracking')
          .insert(trackingInserts);

        if (trackingError) {
          console.warn('Failed to update tracking:', trackingError);
        }
      }
    },
    onSuccess: () => {
      toast.success('Location updated');
      queryClient.invalidateQueries({ queryKey: ['delivery-partner-location', user?.id] });
      // Also invalidate order details queries to update maps
      queryClient.invalidateQueries({ queryKey: ['order-details'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-tracking'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to set location'),
  });

  return (
    <div className="p-4 border rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <div className="font-medium">My Current Location</div>
        </div>
        <Button size="sm" onClick={() => setLocation.mutate()} disabled={setLocation.isPending || isLoading || !partner?.id}>
          Use Current Location
        </Button>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        {isLoading ? 'Loading…' : partner ? (
          partner.latitude != null && partner.longitude != null
            ? <>Lat: {partner.latitude} • Lon: {partner.longitude}</>
            : <>Not set</>
        ) : 'No partner profile found'}
      </div>
    </div>
  );
};

const AssignedRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([] as string[]);
  const HIDDEN_STORAGE_KEY = 'hiddenDeliveryRequestIds';
  const [view, setView] = useState<'live' | 'history'>('live');

  // Load hidden list from localStorage so removed items stay hidden after refresh
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HIDDEN_STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) setHiddenRequestIds(saved);
    } catch { }
  }, []);

  const persistHidden = (next: string[]) => {
    setHiddenRequestIds(next);
    try { localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify(next)); } catch { }
  };

  const { data: partner } = useQuery({
    queryKey: ['delivery-partner', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_partners')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string } | null;
    },
  });

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['delivery-requests', partner?.id],
    enabled: !!partner?.id,
    queryFn: async () => {
      // Minimal working selection to avoid RLS/join issues
      const { data, error } = await (supabase as any)
        .from('delivery_requests')
        .select(`*`)
        .eq('assigned_partner_id', partner!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      let rows = (data || []) as any[];

      // Get order visibility for this delivery partner to filter out hidden orders
      // Temporarily skip visibility filtering to ensure assigned orders show
      return rows as any[];
    },
  });

  // After acceptance, fetch order items so the partner sees item list
  const [orderItemsByOrderId, setOrderItemsByOrderId] = useState<Record<string, Array<{ id: string; quantity: number; snapshot_name: string; snapshot_price: number }>>>({});
  const [userByOrderId, setUserByOrderId] = useState<Record<string, { full_name?: string | null; phone?: string | null }>>({});
  const [addressByOrderId, setAddressByOrderId] = useState<Record<string, { full_address?: string | null; city?: string | null; state?: string | null; pincode?: string | null; phone?: string | null; latitude?: number | null; longitude?: number | null }>>({});
  const [vendorById, setVendorById] = useState<Record<string, { business_name?: string | null; business_address?: string | null }>>({});
  const [orderAmountById, setOrderAmountById] = useState<Record<string, { final_amount?: number | null; subtotal?: number | null; payment_status?: string | null; payment_id?: string | null; is_order_for_someone_else?: boolean | null }>>({});
  useEffect(() => {
    const loadItems = async (orderId: string) => {
      const { data: items } = await supabase
        .from('order_items')
        .select('id, quantity, snapshot_name, snapshot_price')
        .eq('order_id', orderId);
      setOrderItemsByOrderId(prev => ({ ...prev, [orderId]: items || [] }));
    };
    const loadUserAndAddress = async (orderId: string) => {
      try {
        // Use secure RPC so RLS allows fetching details for assigned partner
        const { data: details, error } = await (supabase as any)
          .rpc('get_delivery_order_details', { p_order_id: orderId, p_partner_user_id: user!.id });
        if (error) {
          console.error('RPC get_delivery_order_details error:', error);
          return;
        }
        // RPC returns a single row (object), not array
        const row = Array.isArray(details) ? details[0] : details;
        if (row) {
          console.log('Loaded user details for order:', orderId, row);
          setUserByOrderId(prev => ({ ...prev, [orderId]: { full_name: row.full_name, phone: row.phone } }));

          // The RPC should already return alternate coordinates if they exist (COALESCE in migration)
          // But we'll also double-check the order row to ensure we have the latest data
          let finalLat = row.latitude != null ? Number(row.latitude) : null;
          let finalLon = row.longitude != null ? Number(row.longitude) : null;
          let isForSomeoneElse = row.is_order_for_someone_else ?? false;

          // Double-check order row for alternate coordinates (in case RPC didn't return them)
          try {
            const { data: orderAlt } = await (supabase as any)
              .from('orders')
              .select('is_order_for_someone_else, alt_drop_latitude, alt_drop_longitude')
              .eq('id', orderId)
              .maybeSingle();

            // Prioritize alternate coordinates if they exist
            if (orderAlt?.alt_drop_latitude != null && orderAlt?.alt_drop_longitude != null) {
              finalLat = Number(orderAlt.alt_drop_latitude);
              finalLon = Number(orderAlt.alt_drop_longitude);
              isForSomeoneElse = !!orderAlt.is_order_for_someone_else;
              console.log('Using alternate drop coordinates for order:', orderId, { lat: finalLat, lon: finalLon });
            }
          } catch (e) {
            console.warn('Failed to load alt drop coords:', e);
          }

          setAddressByOrderId((prev: any) => ({
            ...prev,
            [orderId]: {
              ...(prev[orderId] || {}),
              full_address: row.full_address,
              city: row.city,
              state: row.state,
              pincode: row.pincode,
              phone: row.phone,
              latitude: finalLat,
              longitude: finalLon,
            },
          }));
          setOrderAmountById(prev => ({
            ...prev, [orderId]: {
              final_amount: row.final_amount,
              subtotal: row.subtotal,
              payment_status: row.payment_status,
              is_order_for_someone_else: isForSomeoneElse,
            }
          }));
        } else {
          console.warn('No details returned from RPC for order:', orderId);
        }
      } catch (e) {
        console.error('Error loading user and address:', e);
      }
    };
    const loadVendor = async (vendorId: string) => {
      if (!vendorId || vendorById[vendorId]) return;
      const { data } = await supabase
        .from('vendors')
        .select('business_name, business_address')
        .eq('id', vendorId)
        .maybeSingle();
      if (data) setVendorById(prev => ({ ...prev, [vendorId]: data }));
    };
    const loadOrderAmount = async (orderId: string) => {
      if (!orderId) return;
      // Always reload if payment_id is missing to ensure we have the latest data
      const existing = orderAmountById[orderId];
      if (existing && existing.payment_id !== undefined && existing.payment_id !== null) return;
      const { data } = await (supabase as any)
        .from('orders')
        .select('final_amount, subtotal, payment_status, payment_id, is_order_for_someone_else')
        .eq('id', orderId)
        .maybeSingle();
      if (data) setOrderAmountById((prev: any) => ({ ...prev, [orderId]: data }));
    };
    (requests || []).forEach((r: any) => {
      const status = r.orders?.delivery_status || r.status;
      // Load vendor and order amount for all visible rows (assigned and beyond)
      if (r.vendor_id) loadVendor(r.vendor_id);
      if (r.order_id) loadOrderAmount(r.order_id);

      if ((status === 'assigned' || status === 'accepted' || status === 'picked_up' || status === 'out_for_delivery' || status === 'delivered') && r.order_id && !orderItemsByOrderId[r.order_id]) {
        loadItems(r.order_id);
      }
      // Load user details for any active status - reload if phone/name missing
      if ((status === 'assigned' || status === 'accepted' || status === 'picked_up' || status === 'out_for_delivery' || status === 'delivered') && r.order_id) {
        const hasUser = userByOrderId[r.order_id]?.full_name || userByOrderId[r.order_id]?.phone;
        const hasAddress = addressByOrderId[r.order_id]?.phone;
        if (!hasUser || !hasAddress) {
          loadUserAndAddress(r.order_id);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  // Optimistic cache helpers for delivery requests
  const optimisticallyUpdateRequest = async (
    requestId: string,
    updater: (prev: any[]) => any[]
  ) => {
    await queryClient.cancelQueries({ queryKey: ['delivery-requests', partner?.id] });
    const prev = queryClient.getQueryData<any[]>(['delivery-requests', partner?.id]) || [];
    const next = updater(prev);
    queryClient.setQueryData(['delivery-requests', partner?.id], next);
    return { prev } as { prev: any[] };
  };

  const invalidateAllOrderConsumers = () => {
    // Invalidate user Orders page and vendor dashboards that may display the same order
    queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'orders' });
    queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'vendor-orders' });
    // Also invalidate any queries that might be caching order data
    queryClient.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && (
          q.queryKey[0] === 'orders' ||
          String(q.queryKey[0]).includes('vendor-orders') ||
          String(q.queryKey[0]).includes('order')
        )
    });
  };

  useEffect(() => {
    if (!partner?.id) return;
    const channel = supabase
      .channel(`delivery-partner-${partner.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_requests', filter: `assigned_partner_id=eq.${partner.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['delivery-requests', partner.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['delivery-requests', partner.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [partner?.id, queryClient]);
  const removeFromDashboard = async (requestId: string) => {
    try {
      // Get the order_id from the delivery request
      const { data: request, error: fetchError } = await (supabase as any)
        .from('delivery_requests')
        .select('order_id')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Hide order from delivery partner's history using RPC
      const { error } = await (supabase as any).rpc('delivery_delete_order', {
        p_order_id: request.order_id
      });

      if (error) throw error;
      toast.success('Order removed from your history');
    } catch (e: any) {
      // Fallback: hide locally so dashboard is cleaned
      toast('Removed locally');
    } finally {
      const next = Array.from(new Set([...(hiddenRequestIds || []), requestId]));
      persistHidden(next);
      refetch();
    }
  };

  const respond = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'accepted' | 'rejected' }) => {
      const { error: insErr } = await (supabase as any)
        .from('delivery_partner_responses')
        .insert({ request_id: requestId, partner_id: partner!.id, action });
      if (insErr) throw insErr;

      const newStatus = action === 'accepted' ? 'accepted' : 'rejected_by_partner';
      const { error: updErr } = await (supabase as any)
        .from('delivery_requests')
        .update({ status: newStatus })
        .eq('id', requestId);
      if (updErr) throw updErr;

      // If accepted, reflect in orders table so user/vendor see live 'approved'
      if (action === 'accepted') {
        // Find the request to get order_id
        const req = (queryClient.getQueryData<any[]>(['delivery-requests', partner?.id]) || []).find((r: any) => r.id === requestId);
        if (req?.order_id) {
          await supabase.from('orders').update({ delivery_status: 'approved' as any }).eq('id', req.order_id);
          // Immediately trigger user data load after acceptance
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['delivery-requests', partner?.id] });
          }, 100);
        }
      }
    },
    onMutate: async (vars) => {
      const newStatus = vars.action === 'accepted' ? 'accepted' : 'rejected_by_partner';
      return await optimisticallyUpdateRequest(vars.requestId, (prev) =>
        prev.map((r) => r.id === vars.requestId ? { ...r, status: newStatus, orders: { ...(r.orders || {}), delivery_status: vars.action === 'accepted' ? 'approved' : r.orders?.delivery_status } } : r)
      );
    },
    onError: (e: any, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['delivery-requests', partner?.id], ctx.prev);
      toast.error(e?.message || 'Failed to respond');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests', partner?.id] });
      invalidateAllOrderConsumers();
    },
  });

  const markPickedUp = useMutation({
    mutationFn: async (request: any) => {
      const { error } = await (supabase as any)
        .from('delivery_requests')
        .update({ status: 'picked_up', picked_up_at: new Date().toISOString() })
        .eq('id', request.id);
      if (error) throw error;
      const { error: orderError } = await supabase
        .from('orders')
        .update({ delivery_status: 'picked_up' })
        .eq('id', request.order_id);
      if (orderError) throw orderError;
    },
    onMutate: async (request: any) => {
      return await optimisticallyUpdateRequest(request.id, (prev) =>
        prev.map((r) => r.id === request.id ? { ...r, status: 'picked_up', picked_up_at: new Date().toISOString(), orders: { ...(r.orders || {}), delivery_status: 'picked_up' } } : r)
      );
    },
    onError: (_err, request, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['delivery-requests', partner?.id], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests', partner?.id] });
      invalidateAllOrderConsumers();
    },
  });

  const markOutForDelivery = useMutation({
    mutationFn: async (request: any) => {
      // Get current location first
      const pos = await getCurrentPosition();

      const { error } = await (supabase as any)
        .from('delivery_requests')
        .update({ status: 'out_for_delivery' })
        .eq('id', request.id);
      if (error) throw error;

      const { error: orderError } = await supabase
        .from('orders')
        .update({ delivery_status: 'out_for_delivery' })
        .eq('id', request.order_id);
      if (orderError) throw orderError;

      // Update delivery partner location
      if (partner?.id && pos) {
        await (supabase as any)
          .from('delivery_partners')
          .update({ latitude: pos.lat, longitude: pos.lon })
          .eq('id', partner.id);
      }

      // Insert initial tracking record
      if (partner?.id && pos) {
        await (supabase as any)
          .from('delivery_tracking')
          .insert({
            order_id: request.order_id,
            partner_id: partner.id,
            latitude: pos.lat,
            longitude: pos.lon,
          });
      }
    },
    onMutate: async (request: any) => {
      return await optimisticallyUpdateRequest(request.id, (prev) =>
        prev.map((r) => r.id === request.id ? { ...r, status: 'out_for_delivery', orders: { ...(r.orders || {}), delivery_status: 'out_for_delivery' } } : r)
      );
    },
    onError: (_err, request, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['delivery-requests', partner?.id], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests', partner?.id] });
      queryClient.invalidateQueries({ queryKey: ['delivery-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['order-details'] });
      invalidateAllOrderConsumers();
    },
  });

  const markPaymentReceived = useMutation({
    mutationFn: async (request: any) => {
      // Use RPC function to update payment status (bypasses RLS)
      console.log('Marking payment as received for order:', request.order_id);

      const { data: updatedData, error: rpcError } = await (supabase as any)
        .rpc('delivery_mark_payment_received', { p_order_id: request.order_id });

      if (rpcError) {
        console.error('Error updating payment status via RPC:', rpcError);
        throw rpcError;
      }

      if (!updatedData || updatedData.length === 0) {
        console.error('No data returned from RPC');
        throw new Error('Failed to update payment status - no data returned');
      }

      const result = updatedData[0];
      console.log('Payment status updated successfully:', result);

      // Verify the update was successful
      if (result.payment_status !== 'completed') {
        console.error('Payment status was not updated correctly:', result);
        throw new Error('Payment status was not updated correctly');
      }

      return result;
    },
    onMutate: async (request: any) => {
      // Optimistically update the local state
      const previousState = orderAmountById[request.order_id];
      const currentPaymentId = orderAmountById[request.order_id]?.payment_id;
      setOrderAmountById((prev: any) => ({
        ...prev,
        [request.order_id]: {
          ...prev[request.order_id],
          payment_status: 'completed',
          payment_id: currentPaymentId || prev[request.order_id]?.payment_id || 'COD' // Preserve payment_id
        }
      }));
      return { previousState };
    },
    onError: (e: any, request, ctx) => {
      // Revert optimistic update on error
      if (ctx?.previousState !== undefined) {
        setOrderAmountById((prev: any) => ({
          ...prev,
          [request.order_id]: ctx.previousState
        }));
      }
      toast.error(e?.message || 'Failed to mark payment as received');
    },
    onSuccess: async (result: any, request: any) => {
      console.log('Payment received mutation successful:', result);

      // Update local state with the returned data from RPC
      if (result) {
        setOrderAmountById((prev: any) => ({
          ...prev,
          [request.order_id]: {
            ...prev[request.order_id],
            payment_status: result.payment_status,
            payment_id: result.payment_id
          }
        }));
      }

      // Try to reload order data to ensure everything is in sync
      // This might fail due to RLS, so we handle it gracefully
      try {
        const { data: reloadedOrder, error: reloadError } = await (supabase as any)
          .from('orders')
          .select('final_amount, subtotal, payment_status, payment_id, is_order_for_someone_else')
          .eq('id', request.order_id)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 rows gracefully

        if (reloadError) {
          // Silently ignore RLS errors - we already have the data from RPC
          if (reloadError.code !== 'PGRST116') {
            console.warn('Error reloading order data (non-critical):', reloadError);
          }
        } else if (reloadedOrder) {
          console.log('Reloaded order data:', reloadedOrder);
          setOrderAmountById((prev: any) => ({
            ...prev,
            [request.order_id]: reloadedOrder
          }));
        }
      } catch (e) {
        // Silently ignore errors - we already have the data from RPC
        console.warn('Could not reload order data (non-critical):', e);
      }

      toast.success('Payment received! You can now mark as delivered.');

      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['delivery-requests', partner?.id] });
      invalidateAllOrderConsumers();

      // Force refetch vendor orders to ensure payment status is updated
      // Use setTimeout to ensure the database update is committed before refetching
      setTimeout(() => {
        queryClient.refetchQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'vendor-orders' });
        // Also refetch delivery requests to update the UI
        queryClient.refetchQueries({ queryKey: ['delivery-requests', partner?.id] });
      }, 500);
    },
  });

  const markDelivered = useMutation({
    mutationFn: async (request: any) => {
      const { error } = await (supabase as any)
        .from('delivery_requests')
        .update({ status: 'delivered', delivered_at: new Date().toISOString() })
        .eq('id', request.id);
      if (error) throw error;
      const { error: orderError } = await supabase
        .from('orders')
        .update({ delivery_status: 'delivered' })
        .eq('id', request.order_id);
      if (orderError) throw orderError;
    },
    onMutate: async (request: any) => {
      return await optimisticallyUpdateRequest(request.id, (prev) =>
        prev.map((r) => r.id === request.id ? { ...r, status: 'delivered', delivered_at: new Date().toISOString(), orders: { ...(r.orders || {}), delivery_status: 'delivered' } } : r)
      );
    },
    onError: (_err, request, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['delivery-requests', partner?.id], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests', partner?.id] });
      invalidateAllOrderConsumers();
    },
  });

  const openNavToVendor = async (request: any) => {
    // Origin: delivery partner location (DB), fallback to device GPS
    const { data: partnerRow } = await (supabase as any)
      .from('delivery_partners')
      .select('latitude, longitude')
      .eq('id', partner!.id)
      .maybeSingle();
    let originLat = (partnerRow as any)?.latitude ?? null;
    let originLon = (partnerRow as any)?.longitude ?? null;
    if (originLat == null || originLon == null) {
      const me = await getCurrentPosition();
      originLat = me?.lat ?? null;
      originLon = me?.lon ?? null;
    }

    // Destination: vendor lat/lon
    const { data: vendorRow } = await (supabase as any)
      .from('vendors')
      .select('latitude, longitude')
      .eq('id', request.vendor_id)
      .maybeSingle();
    const vlat = (vendorRow as any)?.latitude;
    const vlon = (vendorRow as any)?.longitude;
    if (originLat == null || originLon == null) return toast.error('Your location not set');
    if (vlat == null || vlon == null) return toast.error('Vendor location not set');
    console.log('Nav to Vendor - origin:', { originLat, originLon }, 'dest (vendor):', { vlat, vlon });
    const url = buildMapsDirectionUrl({
      origin: { lat: originLat, lon: originLon },
      destination: { lat: vlat, lon: vlon },
      travelMode: 'driving',
      navigate: true,
    });
    openGoogleMaps(url);
  };

  const openNavToCustomer = async (request: any) => {
    // Origin: delivery partner location (DB), fallback to device GPS
    const { data: partnerRow } = await (supabase as any)
      .from('delivery_partners')
      .select('latitude, longitude')
      .eq('id', partner!.id)
      .maybeSingle();
    let originLat = (partnerRow as any)?.latitude ?? null;
    let originLon = (partnerRow as any)?.longitude ?? null;
    if (originLat == null || originLon == null) {
      const me = await getCurrentPosition();
      originLat = me?.lat ?? null;
      originLon = me?.lon ?? null;
    }

    // Always fetch fresh address details to ensure we have the latest coordinates
    // This bypasses any stale state in addressByOrderId
    let ulat: number | null = null;
    let ulon: number | null = null;
    let isAlt = false;

    try {
      // 1. Try to get fresh details via RPC first (most reliable for delivery partner)
      const { data: details, error: rpcError } = await (supabase as any)
        .rpc('get_delivery_order_details', { p_order_id: request.order_id, p_partner_user_id: user!.id });

      if (!rpcError && details) {
        const row = Array.isArray(details) ? details[0] : details;
        if (row) {
          ulat = row.latitude != null ? Number(row.latitude) : null;
          ulon = row.longitude != null ? Number(row.longitude) : null;
          isAlt = row.is_order_for_someone_else ?? false;
          console.log('Fresh RPC coordinates:', { ulat, ulon, isAlt });
        }
      }

      // 2. Double check the orders table for direct alternate coordinates update
      const { data: orderRow } = await (supabase as any)
        .from('orders')
        .select('address_id, alt_drop_latitude, alt_drop_longitude, is_order_for_someone_else')
        .eq('id', request.order_id)
        .maybeSingle();

      if (orderRow) {
        // If order has explicit alt coordinates, they take precedence
        if (orderRow.alt_drop_latitude != null && orderRow.alt_drop_longitude != null) {
          ulat = Number(orderRow.alt_drop_latitude);
          ulon = Number(orderRow.alt_drop_longitude);
          isAlt = !!orderRow.is_order_for_someone_else;
          console.log('Fresh Order Alt coordinates:', { ulat, ulon });
        }
        // If we still don't have coordinates, fetch from the linked address
        else if ((ulat == null || ulon == null) && orderRow.address_id) {
          const { data: addressRow } = await (supabase as any)
            .from('addresses')
            .select('latitude, longitude')
            .eq('id', orderRow.address_id)
            .maybeSingle();

          if (addressRow) {
            ulat = addressRow.latitude != null ? Number(addressRow.latitude) : null;
            ulon = addressRow.longitude != null ? Number(addressRow.longitude) : null;
            console.log('Fresh Address coordinates:', { ulat, ulon });
          }
        }
      }
    } catch (e) {
      console.error('Error fetching fresh coordinates:', e);
    }

    if (ulat != null && ulon != null) {
      if (originLat == null || originLon == null) {
        const me = await getCurrentPosition();
        originLat = me?.lat ?? null;
        originLon = me?.lon ?? null;
      }
      if (originLat == null || originLon == null) {
        return toast.error('Your location not set');
      }

      try { toast.success(`Routing to ${isAlt ? 'alternate' : 'customer'} location: ${Number(ulat).toFixed(6)}, ${Number(ulon).toFixed(6)}`); } catch { }
      const url = buildMapsDirectionUrl({
        origin: { lat: Number(originLat), lon: Number(originLon) },
        destination: { lat: Number(ulat), lon: Number(ulon) },
        travelMode: 'driving',
        navigate: true,
      });
      return openGoogleMaps(url);
    }

    // Fallback to cached data if fresh fetch failed completely (unlikely)
    if ((ulat == null || ulon == null) && orderRow?.address_id) {
      const { data: addressRow } = await (supabase as any)
        .from('addresses')
        .select('latitude, longitude')
        .eq('id', orderRow.address_id)
        .maybeSingle();
      ulat = ulat ?? ((addressRow as any)?.latitude ?? null);
      ulon = ulon ?? ((addressRow as any)?.longitude ?? null);
    }
    // If we have RPC-fetched coordinates, prefer them (more reliable through RLS)
    const rpcAddr = (addressByOrderId as any)[request.order_id];
    if ((ulat == null || ulon == null) && rpcAddr?.latitude != null && rpcAddr?.longitude != null) {
      ulat = rpcAddr.latitude;
      ulon = rpcAddr.longitude;
    }

    // If no address location, try user profile
    if ((ulat == null || ulon == null) && orderRow?.user_id) {
      const { data: profileRow } = await (supabase as any)
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', orderRow.user_id)
        .maybeSingle();
      ulat = ulat ?? ((profileRow as any)?.latitude ?? null);
      ulon = ulon ?? ((profileRow as any)?.longitude ?? null);
    }

    // If still missing, use current position as fallback
    if (ulat == null || ulon == null) {
      const me = await getCurrentPosition();
      ulat = me?.lat ?? null;
      ulon = me?.lon ?? null;
    }

    if (ulat == null || ulon == null) {
      return toast.error('Customer location missing. Ask user to set location in Profile or set on address.');
    }
    if (originLat == null || originLon == null) return toast.error('Your location not set');

    console.log('Nav to Customer - origin (partner):', { originLat, originLon }, 'dest (user):', { ulat, ulon }, 'is_for_someone_else:', orderRow?.is_order_for_someone_else);
    try { toast.success(`Routing to: ${Number(ulat).toFixed(6)}, ${Number(ulon).toFixed(6)}`); } catch { }
    const url = buildMapsDirectionUrl({
      origin: { lat: Number(originLat), lon: Number(originLon) },
      destination: { lat: Number(ulat), lon: Number(ulon) },
      travelMode: 'driving',
      navigate: true,
    });
    openGoogleMaps(url);
  };

  // Start lightweight tracking when out_for_delivery: watch position and insert rows
  useEffect(() => {
    if (!requests || !partner?.id) return;
    const active = requests.find((r: any) => r.status === 'out_for_delivery');
    if (!active) return;

    // Start watching position and updating tracking every 10 seconds
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 10000; // Update every 10 seconds

    const stop = startPositionWatch(async (pos) => {
      const now = Date.now();
      if (now - lastUpdate < UPDATE_INTERVAL) return; // Throttle updates
      lastUpdate = now;

      try {
        // Update delivery partner location
        await (supabase as any)
          .from('delivery_partners')
          .update({ latitude: pos.lat, longitude: pos.lon })
          .eq('id', partner.id);

        // Insert tracking record
        await (supabase as any).from('delivery_tracking').insert({
          order_id: active.order_id,
          partner_id: partner.id,
          latitude: pos.lat,
          longitude: pos.lon,
        });
      } catch (error) {
        // Silently handle errors to prevent console spam
      }
    });

    return () => stop();
  }, [requests, partner]);

  if (!partner?.id) {
    return (
      <div className="p-4 border rounded-md">
        <p className="text-sm text-muted-foreground">No delivery partner profile found for your account.</p>
        <div className="mt-2">
          <a href="/delivery/register" className="px-3 py-2 border rounded text-sm">Apply as Delivery Partner</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Assigned Requests</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={view === 'live' ? 'default' : 'outline'} onClick={() => setView('live')}>Live</Button>
          <Button size="sm" variant={view === 'history' ? 'default' : 'outline'} onClick={() => setView('history')}>History</Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Refresh</Button>
        </div>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !requests || requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No assigned requests.</p>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {requests
            .filter((r: any) => !hiddenRequestIds.includes(r.id))
            .filter((r: any) => {
              const s = r.orders?.delivery_status || r.status;
              if (view === 'history') return ['delivered', 'rejected_by_partner', 'cancelled'].includes(s);
              return !['delivered', 'rejected_by_partner', 'cancelled'].includes(s);
            })
            .map((r: any) => (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Order #{r.order_id?.slice(0, 8)}
                    <span className="text-xs uppercase ml-2 text-muted-foreground">{STATUS_LABEL[(r.orders?.delivery_status || r.status || 'pending') as any] || (r.orders?.delivery_status || r.status || 'pending')}</span>
                  </CardTitle>
                  {(orderAmountById[r.order_id]?.is_order_for_someone_else || r.orders?.is_order_for_someone_else) && (
                    <div className="mt-1"><span className="text-[10px] uppercase bg-secondary text-secondary-foreground px-2 py-0.5 rounded">For Someone Else</span></div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div>
                      Vendor: <span className="font-medium">{r.vendors?.business_name || vendorById[r.vendor_id]?.business_name || r.vendor_id}</span>
                    </div>
                    {(r.vendors?.business_address || vendorById[r.vendor_id]?.business_address) && (
                      <div className="text-xs text-muted-foreground">{r.vendors?.business_address || vendorById[r.vendor_id]?.business_address}</div>
                    )}
                    {r.orders?.created_at && (
                      <div className="text-xs text-muted-foreground">Placed: {new Date(r.orders.created_at).toLocaleString()}</div>
                    )}
                    <div className="text-xs space-y-1">
                      {(() => {
                        // Prefer RPC values (populated after acceptance) over raw order values
                        const rpcAmt = orderAmountById[r.order_id]?.final_amount ?? orderAmountById[r.order_id]?.subtotal;
                        const rawAmt = r.orders?.final_amount ?? r.orders?.subtotal;
                        const amtNum = Number(rpcAmt ?? rawAmt ?? 0);
                        const formatted = isFinite(amtNum) ? amtNum.toFixed(2) : '0.00';
                        return <>Amount: ₹{formatted}</>;
                      })()}
                      {(() => {
                        // Show payment method and status after accepting
                        const paymentId = orderAmountById[r.order_id]?.payment_id || r.orders?.payment_id;
                        const paymentStatus = orderAmountById[r.order_id]?.payment_status || r.orders?.payment_status;
                        // Determine payment method: if payment_id is 'COD', it's COD; if payment_id exists and is not 'COD', it's Online; otherwise check payment_status
                        let paymentMethod = '—';
                        if (paymentId === 'COD' || paymentId === 'cod') {
                          paymentMethod = 'COD';
                        } else if (paymentId && paymentId !== 'COD' && paymentId !== 'cod') {
                          paymentMethod = 'Online';
                        } else if (paymentStatus === 'completed' && !paymentId) {
                          // If payment is completed but no payment_id, assume it's online (since COD would have payment_id = 'COD')
                          paymentMethod = 'Online';
                        } else if (paymentStatus === 'pending' && !paymentId) {
                          // If payment is pending and no payment_id, assume it's COD (default)
                          paymentMethod = 'COD';
                        }
                        const isPaymentDone = paymentStatus === 'completed';
                        return (
                          <div className="flex items-center gap-2">
                            <span>Payment Method: <span className={paymentMethod === 'COD' ? 'text-blue-600 font-semibold' : paymentMethod === 'Online' ? 'text-green-600 font-semibold' : ''}>{paymentMethod}</span></span>
                            <span>•</span>
                            <span>Payment Status: <span className={isPaymentDone ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>{isPaymentDone ? 'Done' : 'Not Done'}</span></span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Removed compact pre-accept banner; details show after accept */}

                  {view === 'live' && (r.orders?.delivery_status === 'assigned' || r.status === 'assigned') && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => respond.mutate({ requestId: r.id, action: 'accepted' })}>
                        <Check className="h-4 w-4 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => respond.mutate({ requestId: r.id, action: 'rejected' })}>
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openNavToVendor(r)}>Navigate to Vendor</Button>
                    </div>
                  )}

                  {view === 'live' && (r.orders?.delivery_status === 'assigned' || r.status === 'accepted') && (
                    <>
                      {/* Customer block: add user name + address + phone (nested or RPC fallback) */}
                      {(() => {
                        const nestedAddr = r.orders?.addresses;
                        const nestedPhone = Array.isArray(nestedAddr) ? nestedAddr[0]?.phone : nestedAddr?.phone;
                        const nestedAddressLine = Array.isArray(nestedAddr) ? nestedAddr[0]?.full_address : nestedAddr?.full_address;
                        const fb = addressByOrderId[r.order_id] || {};
                        const ufb = userByOrderId[r.order_id] || {};
                        const phoneNumber = nestedPhone || fb.phone || null;
                        const addressLine = nestedAddressLine || fb.full_address || null;
                        const cityState = [fb.city, fb.state].filter(Boolean).join(', ');
                        const pin = fb.pincode ? ` - ${fb.pincode}` : '';
                        const isAltLocation = orderAmountById[r.order_id]?.is_order_for_someone_else || r.orders?.is_order_for_someone_else;
                        const hasAltCoords = fb.latitude != null && fb.longitude != null;

                        if (phoneNumber || addressLine || hasAltCoords) {
                          return (
                            <div className="p-2 border rounded bg-muted/20 text-xs space-y-1">
                              {ufb.full_name && (
                                <div className="font-medium text-foreground">Customer: {ufb.full_name}</div>
                              )}
                              {isAltLocation && (
                                <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                  <MapPin className="h-3 w-3" />
                                  <span className="font-semibold">Alternate Drop Location Selected</span>
                                </div>
                              )}
                              {addressLine && (
                                <div className="text-muted-foreground">
                                  {isAltLocation ? 'Original Address' : 'Delivery'}: {addressLine}{cityState || pin ? `, ${cityState}${pin}` : ''}
                                </div>
                              )}
                              {isAltLocation && hasAltCoords && (
                                <div className="text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  Drop Location: {Number(fb.latitude).toFixed(6)}, {Number(fb.longitude).toFixed(6)}
                                </div>
                              )}
                              {phoneNumber && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-green-600" />
                                  <span className="font-medium">{phoneNumber}</span>
                                  <a href={`tel:${phoneNumber.replace(/\D/g, '')}`} className="ml-auto">
                                    <Button size="sm" variant="outline" className="h-7">Call</Button>
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Payment Information - shown after accepting */}
                      {(() => {
                        const paymentId = orderAmountById[r.order_id]?.payment_id || r.orders?.payment_id;
                        const paymentStatus = orderAmountById[r.order_id]?.payment_status || r.orders?.payment_status;
                        // Determine payment method: if payment_id is 'COD', it's COD; if payment_id exists and is not 'COD', it's Online; otherwise check payment_status
                        let paymentMethod = '—';
                        if (paymentId === 'COD' || paymentId === 'cod') {
                          paymentMethod = 'COD';
                        } else if (paymentId && paymentId !== 'COD' && paymentId !== 'cod') {
                          paymentMethod = 'Online';
                        } else if (paymentStatus === 'completed' && !paymentId) {
                          // If payment is completed but no payment_id, assume it's online (since COD would have payment_id = 'COD')
                          paymentMethod = 'Online';
                        } else if (paymentStatus === 'pending' && !paymentId) {
                          // If payment is pending and no payment_id, assume it's COD (default)
                          paymentMethod = 'COD';
                        }
                        const isPaymentDone = paymentStatus === 'completed';
                        return (
                          <div className="p-2 bg-muted/30 rounded-md border">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                              <div>
                                <span className="font-medium">Payment Method: </span>
                                <span className={paymentMethod === 'COD' ? 'text-blue-600 font-semibold' : paymentMethod === 'Online' ? 'text-green-600 font-semibold' : ''}>
                                  {paymentMethod}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Payment Status: </span>
                                <span className={isPaymentDone ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
                                  {isPaymentDone ? 'Done' : 'Not Done'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Order items */}
                      {orderItemsByOrderId[r.order_id] && orderItemsByOrderId[r.order_id].length > 0 && (
                        <div className="border rounded p-2">
                          <div className="text-xs font-semibold mb-1">Items</div>
                          <div className="space-y-1">
                            {orderItemsByOrderId[r.order_id].map((it) => (
                              <div key={it.id} className="flex items-center justify-between text-xs">
                                <div className="truncate mr-2">{it.snapshot_name}</div>
                                <div className="whitespace-nowrap">x{it.quantity} • ₹{it.snapshot_price}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openNavToVendor(r)}>Open Navigation to Vendor</Button>
                        <Button size="sm" variant="outline" onClick={() => markPickedUp.mutate(r)}>Mark Picked Up</Button>
                      </div>
                    </>
                  )}

                  {view === 'live' && (r.orders?.delivery_status === 'picked_up' || r.status === 'picked_up') && (
                    <>
                      {/* Detailed customer info persists after picked_up */}
                      {(() => {
                        const nestedAddr = r.orders?.addresses;
                        const nestedPhone = Array.isArray(nestedAddr) ? nestedAddr[0]?.phone : nestedAddr?.phone;
                        const nestedAddressLine = Array.isArray(nestedAddr) ? nestedAddr[0]?.full_address : nestedAddr?.full_address;
                        const fb = addressByOrderId[r.order_id] || {};
                        const ufb = userByOrderId[r.order_id] || {};
                        const phoneNumber = nestedPhone || fb.phone || null;
                        const addressLine = nestedAddressLine || fb.full_address || null;
                        const cityState = [fb.city, fb.state].filter(Boolean).join(', ');
                        const pin = fb.pincode ? ` - ${fb.pincode}` : '';
                        const isAltLocation = orderAmountById[r.order_id]?.is_order_for_someone_else || r.orders?.is_order_for_someone_else;
                        const hasAltCoords = fb.latitude != null && fb.longitude != null;

                        if (phoneNumber || addressLine || hasAltCoords) {
                          return (
                            <div className="p-2 border rounded bg-muted/20 text-xs space-y-1 mb-3">
                              {ufb.full_name && (
                                <div className="font-medium text-foreground">Customer: {ufb.full_name}</div>
                              )}
                              {isAltLocation && (
                                <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                  <MapPin className="h-3 w-3" />
                                  <span className="font-semibold">Alternate Drop Location Selected</span>
                                </div>
                              )}
                              {addressLine && (
                                <div className="text-muted-foreground">
                                  {isAltLocation ? 'Original Address' : 'Delivery'}: {addressLine}{cityState || pin ? `, ${cityState}${pin}` : ''}
                                </div>
                              )}
                              {isAltLocation && hasAltCoords && (
                                <div className="text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  Drop Location: {Number(fb.latitude).toFixed(6)}, {Number(fb.longitude).toFixed(6)}
                                </div>
                              )}
                              {phoneNumber && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-green-600" />
                                  <span className="font-medium">{phoneNumber}</span>
                                  <a href={`tel:${phoneNumber.replace(/\D/g, '')}`} className="ml-auto">
                                    <Button size="sm" variant="outline" className="h-7">Call</Button>
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}


                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { openNavToCustomer(r); markOutForDelivery.mutate(r); }}>Out for Delivery</Button>
                      </div>
                    </>
                  )}

                  {view === 'live' && (r.orders?.delivery_status === 'out_for_delivery' || r.status === 'out_for_delivery') && (
                    <>
                      {/* Detailed customer info persists during out_for_delivery */}
                      {(() => {
                        const nestedAddr = r.orders?.addresses;
                        const nestedPhone = Array.isArray(nestedAddr) ? nestedAddr[0]?.phone : nestedAddr?.phone;
                        const nestedAddressLine = Array.isArray(nestedAddr) ? nestedAddr[0]?.full_address : nestedAddr?.full_address;
                        const fb = addressByOrderId[r.order_id] || {};
                        const ufb = userByOrderId[r.order_id] || {};
                        const phoneNumber = nestedPhone || fb.phone || null;
                        const addressLine = nestedAddressLine || fb.full_address || null;
                        const cityState = [fb.city, fb.state].filter(Boolean).join(', ');
                        const pin = fb.pincode ? ` - ${fb.pincode}` : '';
                        const isAltLocation = orderAmountById[r.order_id]?.is_order_for_someone_else || r.orders?.is_order_for_someone_else;
                        const hasAltCoords = fb.latitude != null && fb.longitude != null;

                        if (phoneNumber || addressLine || hasAltCoords) {
                          return (
                            <div className="p-2 border rounded bg-muted/20 text-xs space-y-1 mb-3">
                              {ufb.full_name && (
                                <div className="font-medium text-foreground">Customer: {ufb.full_name}</div>
                              )}
                              {isAltLocation && (
                                <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                  <MapPin className="h-3 w-3" />
                                  <span className="font-semibold">Alternate Drop Location Selected</span>
                                </div>
                              )}
                              {addressLine && (
                                <div className="text-muted-foreground">
                                  {isAltLocation ? 'Original Address' : 'Delivery'}: {addressLine}{cityState || pin ? `, ${cityState}${pin}` : ''}
                                </div>
                              )}
                              {isAltLocation && hasAltCoords && (
                                <div className="text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  Drop Location: {Number(fb.latitude).toFixed(6)}, {Number(fb.longitude).toFixed(6)}
                                </div>
                              )}
                              {phoneNumber && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-green-600" />
                                  <span className="font-medium">{phoneNumber}</span>
                                  <a href={`tel:${phoneNumber.replace(/\D/g, '')}`} className="ml-auto">
                                    <Button size="sm" variant="outline" className="h-7">Call</Button>
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openNavToCustomer(r)}>Open Navigation to Customer</Button>
                        {(() => {
                          // Check if this is a COD order
                          const paymentId = orderAmountById[r.order_id]?.payment_id || r.orders?.payment_id;
                          const paymentStatus = orderAmountById[r.order_id]?.payment_status || r.orders?.payment_status;
                          // Determine if COD: payment_id is 'COD' or 'cod', or if payment_status is 'pending' and no payment_id (default to COD)
                          const isCOD = paymentId === 'COD' || paymentId === 'cod' || (paymentStatus === 'pending' && !paymentId);
                          const isPaymentDone = paymentStatus === 'completed';

                          // For COD orders: show "Received Money" first, then "Mark as Delivered" after payment is received
                          // For online orders: show "Mark as Delivered" immediately
                          if (isCOD && !isPaymentDone) {
                            // COD order - payment not received yet
                            return (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => markPaymentReceived.mutate(r)}
                                disabled={markPaymentReceived.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Received Money
                              </Button>
                            );
                          } else {
                            // Online order OR COD order with payment received - show "Mark as Delivered"
                            return (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markDelivered.mutate(r)}
                                disabled={markDelivered.isPending}
                              >
                                Mark as Delivered
                              </Button>
                            );
                          }
                        })()}
                      </div>
                    </>
                  )}

                  {view === 'history' && (r.orders?.delivery_status === 'delivered' || r.status === 'delivered') && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => removeFromDashboard(r.id)}>Delete</Button>
                    </div>
                  )}

                  {view === 'history' && r.status === 'rejected_by_partner' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => removeFromDashboard(r.id)}>Delete</Button>
                    </div>
                  )}

                  {view === 'history' && r.status === 'cancelled' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => removeFromDashboard(r.id)}>Delete</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};
