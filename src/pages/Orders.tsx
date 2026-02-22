import { useNavigate, Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download } from 'lucide-react';
import LiveMap from '@/components/LiveMap';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { toast } from 'sonner';
import { STATUS_LABEL, STATUS_COLOR_CLASS, ORDER_STATUSES } from '@/lib/orderStatus';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

class OrdersErrorBoundary extends (class extends (Object as any) { } as any) { }

// Lightweight ErrorBoundary to avoid blank screen on unexpected render errors
class ErrorBoundary extends React.Component<{ children: any }, { hasError: boolean; message?: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: error?.message || 'Something went wrong' };
  }
  componentDidCatch(error: any) {
    console.error('Orders page error:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-destructive">{this.state.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Orders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [hiddenOrderIds, setHiddenOrderIds] = useState<string[]>([] as string[]);
  const HIDDEN_USER_ORDERS_KEY = 'hiddenUserOrderIds';

  // Persist hidden orders so deleted items don't reappear after refresh
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HIDDEN_USER_ORDERS_KEY) || '[]');
      if (Array.isArray(saved)) setHiddenOrderIds(saved);
    } catch { }
  }, []);

  const persistHidden = (next: string[]) => {
    setHiddenOrderIds(next);
    try { localStorage.setItem(HIDDEN_USER_ORDERS_KEY, JSON.stringify(next)); } catch { }
  };

  const isAuthLoading = loading;
  // ensure not re-declared

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get basic orders first to avoid RLS recursion
      const { data: basicOrders, error: basicError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (basicError) throw basicError;
      if (!basicOrders) return [];

      // Get order visibility for this user to filter out hidden orders
      const orderIds = basicOrders.map(o => o.id);
      const { data: visibilityData, error: visibilityError } = await supabase
        .from('order_visibility')
        .select('order_id, is_visible')
        .eq('user_id', user.id)
        .eq('user_type', 'customer')
        .in('order_id', orderIds);

      if (visibilityError) {
        console.error('Error fetching order visibility:', visibilityError);
      }

      // Filter out hidden orders
      const hiddenOrderIds = new Set(
        visibilityData?.filter(v => !v.is_visible).map(v => v.order_id) || []
      );

      const visibleOrders = basicOrders.filter(order => !hiddenOrderIds.has(order.id));

      if (visibleOrders.length === 0) return [];

      // Get order items for visible orders
      const visibleOrderIds = visibleOrders.map(o => o.id);
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products(name)')
        .in('order_id', visibleOrderIds);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
      }

      // Get delivery requests for visible orders (using any type to avoid type issues)
      const { data: deliveryRequests, error: drError } = await (supabase as any)
        .from('delivery_requests')
        .select('order_id, status')
        .in('order_id', visibleOrderIds);

      if (drError) {
        console.error('Error fetching delivery requests:', drError);
      }

      // Combine the data
      const enrichedOrders = visibleOrders.map(order => {
        const orderOrderItems = orderItems?.filter((item: any) => item.order_id === order.id) || [];
        const deliveryRequest = deliveryRequests?.find((dr: any) => dr.order_id === order.id);

        return {
          ...order,
          order_items: orderOrderItems,
          delivery_requests: deliveryRequest ? { status: deliveryRequest.status } : null
        };
      });

      return enrichedOrders;
    },
    enabled: !!user && !isAuthLoading,
    // Fallback polling in case realtime events are missed or disabled on the table
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!user || isAuthLoading) return;
    const channel = supabase
      .channel(`orders-user-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['orders', user.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_requests' }, () => {
        queryClient.invalidateQueries({ queryKey: ['orders', user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, isAuthLoading, queryClient]);

  const allowed = ['delivered', 'cancelled'];

  const deleteOrder = useMutation({
    mutationFn: async (orderId: string) => {
      // Use server-side RPC to hide order from user's history
      const { error } = await (supabase as any).rpc('user_delete_order', { p_order_id: orderId });
      if (error) throw error;
    },
    onSuccess: (_, orderId) => {
      persistHidden(Array.from(new Set([...(hiddenOrderIds || []), orderId as string])));
      toast.success('Order removed from your history.');
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
    },
    onError: (e: any) => {
      toast.error(e?.message || 'Failed to remove order from history');
    },
  });

  const skipReview = useMutation({
    mutationFn: async (orderId: string) => {
      console.log('Skipping review for order:', orderId);
      const { data, error } = await (supabase as any)
        .from('orders')
        .update({ review_status: 'skipped' })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Update successful:', data);
      return data;
    },
    onSuccess: async (data) => {
      console.log('Skip review success, refetching orders...');
      // Force immediate refetch instead of just invalidating
      await queryClient.refetchQueries({ queryKey: ['orders', user?.id] });
      console.log('Orders refetched');
      toast.success('Order moved to history');
    },
    onError: (e: any) => {
      console.error('Skip review error:', e);
      if (e.message?.includes('column') || e.code === '42703') {
        toast.error('Database error: Please run the review_status migration first');
      } else {
        toast.error(e?.message || 'Failed to update order');
      }
    },
  });

  const steps = ORDER_STATUSES;

  const [view, setView] = useState<'live' | 'history'>('live');
  const [reviewOrder, setReviewOrder] = useState<any>(null);

  const downloadReceipt = async (order: any) => {
    try {
      // Fetch order details
      const { data: orderDetails, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order.id)
        .single();

      if (orderError) throw orderError;

      // Fetch customer profile
      const { data: customer, error: customerError } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('id', orderDetails.user_id)
        .maybeSingle();

      if (customerError) {
        throw customerError;
      }

      // Fetch address
      let address = null;
      if (orderDetails.address_id) {
        const { data: addressData, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', orderDetails.address_id)
          .maybeSingle();
        if (!addressError) {
          address = addressData;
        }
      }

      // Fetch delivery partner profile if delivery_partner_id exists
      let deliveryPartner = null;
      if (orderDetails.delivery_partner_id) {
        const { data: partnerProfile, error: partnerError } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .eq('id', orderDetails.delivery_partner_id)
          .maybeSingle();
        if (!partnerError) {
          deliveryPartner = partnerProfile;
        }
      }

      // Fetch order items with vendor information
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products(
            id,
            name,
            vendors(
              id,
              business_name,
              business_address
            )
          )
        `)
        .eq('order_id', order.id);

      if (itemsError) throw itemsError;

      // Get delivery request status
      const { data: deliveryRequest } = await (supabase as any)
        .from('delivery_requests')
        .select('status, assigned_partner_id')
        .eq('order_id', order.id)
        .maybeSingle();

      // Get vendor information (from first order item)
      const vendorInfo = orderItems?.[0]?.products?.vendors || null;

      // Generate receipt HTML
      const receiptHTML = generateReceiptHTML({
        order: orderDetails,
        orderItems: orderItems || [],
        vendor: vendorInfo,
        deliveryPartner: deliveryPartner,
        customer: customer,
        address: address,
        deliveryStatus: deliveryRequest?.status || orderDetails.delivery_status,
      });

      // Create and download the file
      const blob = new Blob([receiptHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${order.id.slice(0, 8)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Receipt downloaded successfully!');
    } catch (error: any) {
      // Log error for debugging (in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('Receipt download error:', error);
      }
      toast.error(error?.message || 'Failed to download receipt');
    }
  };

  const generateReceiptHTML = (data: {
    order: any;
    orderItems: any[];
    vendor: any;
    deliveryPartner: any;
    customer: any;
    address: any;
    deliveryStatus: string;
  }) => {
    const { order, orderItems, vendor, deliveryPartner, customer, address, deliveryStatus } = data;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - Order ${order.id.slice(0, 8)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .receipt { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .company-name { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
    .company-details { color: #666; font-size: 14px; }
    .invoice-title { font-size: 24px; font-weight: bold; color: #333; margin: 20px 0; }
    .order-info { display: flex; justify-content: space-between; margin-bottom: 30px; flex-wrap: wrap; }
    .info-section { flex: 1; min-width: 250px; margin-bottom: 20px; }
    .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
    .info-row { margin-bottom: 8px; }
    .label { font-weight: bold; color: #555; }
    .value { color: #333; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .items-table th { background-color: #f8fafc; font-weight: bold; color: #374151; }
    .items-table tr:nth-child(even) { background-color: #f9fafb; }
    .total-section { margin-top: 30px; text-align: right; }
    .total-row { font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 10px; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .status-delivered { background-color: #d1fae5; color: #065f46; }
    .status-pending { background-color: #fef3c7; color: #92400e; }
    .status-cancelled { background-color: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="company-name">Kassh.IT E-Commerce</div>
      <div class="company-details">
        Order Receipt<br>
        Generated on ${new Date().toLocaleString()}
      </div>
    </div>

    <div class="invoice-title">ORDER RECEIPT</div>

    <div class="order-info">
      <div class="info-section">
        <div class="section-title">Order Information</div>
        <div class="info-row"><span class="label">Order ID:</span> <span class="value">#${order.id.slice(0, 8)}</span></div>
        <div class="info-row"><span class="label">Order Date:</span> <span class="value">${new Date(order.created_at).toLocaleDateString()}</span></div>
        <div class="info-row"><span class="label">Order Time:</span> <span class="value">${new Date(order.created_at).toLocaleTimeString()}</span></div>
        <div class="info-row"><span class="label">Status:</span> <span class="value status-badge status-${deliveryStatus || 'pending'}">${deliveryStatus || 'pending'}</span></div>
        <div class="info-row"><span class="label">Payment Method:</span> <span class="value">${order.payment_id === 'COD' ? 'Cash on Delivery' : order.payment_id ? 'Online Payment' : 'N/A'}</span></div>
        <div class="info-row"><span class="label">Payment Status:</span> <span class="value">${order.payment_status || 'pending'}</span></div>
      </div>
      
      <div class="info-section">
        <div class="section-title">Customer Information</div>
        <div class="info-row"><span class="label">Name:</span> <span class="value">${customer?.full_name || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Phone:</span> <span class="value">${customer?.phone || 'N/A'}</span></div>
        ${address ? `
        <div class="info-row"><span class="label">Address:</span> <span class="value">${address.label || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Location:</span> <span class="value">${address.full_address || 'N/A'}</span></div>
        <div class="info-row"><span class="label">City:</span> <span class="value">${address.city || 'N/A'}, ${address.state || 'N/A'} - ${address.pincode || 'N/A'}</span></div>
        ` : ''}
      </div>
    </div>

    ${vendor ? `
    <div class="info-section">
      <div class="section-title">Vendor Information</div>
      <div class="info-row"><span class="label">Business Name:</span> <span class="value">${vendor.business_name || 'N/A'}</span></div>
      ${vendor.business_address ? `<div class="info-row"><span class="label">Address:</span> <span class="value">${vendor.business_address}</span></div>` : ''}
    </div>
    ` : ''}

    ${deliveryPartner ? `
    <div class="info-section">
      <div class="section-title">Delivery Partner</div>
      <div class="info-row"><span class="label">Name:</span> <span class="value">${deliveryPartner.full_name || 'N/A'}</span></div>
      ${deliveryPartner.phone ? `<div class="info-row"><span class="label">Phone:</span> <span class="value">${deliveryPartner.phone}</span></div>` : ''}
    </div>
    ` : ''}

    <div class="section-title">Order Items</div>
    <table class="items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Vendor</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderItems.map((item: any) => `
        <tr>
          <td>${item.snapshot_name || item.products?.name || 'N/A'}</td>
          <td>${item.products?.vendors?.business_name || 'N/A'}</td>
          <td>${item.quantity}</td>
          <td>₹${item.snapshot_price.toFixed(2)}</td>
          <td>₹${(item.snapshot_price * item.quantity).toFixed(2)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-section">
      <div class="info-row"><span class="label">Subtotal:</span> <span class="value">₹${order.subtotal.toFixed(2)}</span></div>
      ${order.discount_amount > 0 ? `<div class="info-row"><span class="label">Discount:</span> <span class="value">-₹${order.discount_amount.toFixed(2)}</span></div>` : ''}
      ${order.coupon_code ? `<div class="info-row"><span class="label">Coupon Code:</span> <span class="value">${order.coupon_code}</span></div>` : ''}
      <div class="total-row">Total Amount: ₹${order.final_amount.toFixed(2)}</div>
    </div>

    <div class="footer">
      <p>Thank you for your order!</p>
      <p>For any queries, please contact our customer support.</p>
      <p>This is a computer-generated receipt.</p>
    </div>
  </div>
</body>
</html>`;
  };
  const getEffectiveStatus = (o: any) => {
    const dr = (o as any).delivery_requests;
    const drStatus = Array.isArray(dr) ? dr[0]?.status : dr?.status;
    return drStatus || o.delivery_status || 'pending';
  };

  const splitOrders = (list: any[]) => {
    const live: any[] = [];
    const history: any[] = [];

    console.log('=== SPLITTING ORDERS ===');
    console.log('Total orders to split:', list?.length || 0);

    for (const o of list || []) {
      const s = getEffectiveStatus(o);
      const isDeleted = ['deleted', 'user_deleted'].includes(s);

      console.log(`\nOrder ${o.id?.slice(0, 8)}:`);
      console.log(`  - Effective Status: "${s}"`);
      console.log(`  - Review Status: "${o.review_status}"`);
      console.log(`  - Is Deleted: ${isDeleted}`);

      if (isDeleted) {
        console.log(`  → SKIPPED (deleted)`);
        continue;
      }

      // Cancelled always goes to history
      if (s === 'cancelled') {
        console.log(`  → HISTORY (cancelled)`);
        history.push(o);
        continue;
      }

      // Delivered goes to history ONLY if reviewed or skipped
      if (s === 'delivered') {
        const isReviewed = o.review_status === 'reviewed';
        const isSkipped = o.review_status === 'skipped';

        console.log(`  - Is Reviewed: ${isReviewed}`);
        console.log(`  - Is Skipped: ${isSkipped}`);

        if (isReviewed || isSkipped) {
          console.log(`  → HISTORY (delivered + ${o.review_status})`);
          history.push(o);
        } else {
          console.log(`  → LIVE (delivered but pending review)`);
          live.push(o);
        }
      } else {
        console.log(`  → LIVE (status: ${s})`);
        live.push(o);
      }
    }

    console.log(`\n📊 SPLIT RESULTS:`);
    console.log(`  Live Orders: ${live.length}`);
    console.log(`  History Orders: ${history.length}`);
    console.log('=== END SPLIT ===\n');

    return { live, history };
  };
  const { live: liveOrders, history: historyOrders } = splitOrders(orders || []);
  const filteredOrders = view === 'live' ? liveOrders : historyOrders;

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center"><span className="text-sm text-muted-foreground">Loading…</span></div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">My Orders</h1>
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant={view === 'live' ? 'default' : 'outline'}
              onClick={() => setView('live')}
              className="w-full sm:w-auto"
            >
              Live Orders
            </Button>
            <Button
              size="sm"
              variant={view === 'history' ? 'default' : 'outline'}
              onClick={() => setView('history')}
              className="w-full sm:w-auto"
            >
              Order History
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-muted" />
                </Card>
              ))}
            </div>
          ) : !filteredOrders || filteredOrders.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Start shopping to see your orders here!</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {filteredOrders.filter((order) => !hiddenOrderIds.includes(order.id)).map((order) => {
                const effectiveStatus = getEffectiveStatus(order);
                return (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <CardTitle className="text-base sm:text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                          {order.is_order_for_someone_else && (
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-[10px] uppercase">For Someone Else</Badge>
                            </div>
                          )}
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={`text-xs sm:text-sm ${STATUS_COLOR_CLASS[(effectiveStatus || 'pending') as any] || 'bg-gray-500'}`}>
                          {STATUS_LABEL[(effectiveStatus || 'pending') as any] || effectiveStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <UserOrderTracking orderId={order.id} />
                      <StatusTimeline status={(effectiveStatus || 'pending') as string} />
                      
                      {/* Packing Video - Show until order is picked up */}
                      {effectiveStatus !== 'picked_up' && effectiveStatus !== 'out_for_delivery' && effectiveStatus !== 'delivered' && effectiveStatus !== 'cancelled' && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto max-h-[300px] object-cover rounded-lg"
                          >
                            <source src="/packing.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      
                      {/* Delivery Video - Show when order is picked up or out for delivery */}
                      {(effectiveStatus === 'picked_up' || effectiveStatus === 'out_for_delivery') && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto max-h-[300px] object-cover rounded-lg"
                          >
                            <source src="/delivery.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      
                      <div className="space-y-2 mb-3 sm:mb-4">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-medium break-words">{item.products?.name} x {item.quantity}</span>
                              {item.products?.vendors?.business_name && (
                                <span className="text-xs text-muted-foreground">Vendor: {item.products.vendors.business_name}</span>
                              )}
                            </div>
                            <span className="font-semibold whitespace-nowrap ml-2">₹{(item.snapshot_price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-sm sm:text-base">
                        <span>Total</span>
                        <span className="text-primary">₹{order.final_amount}</span>
                      </div>

                      {effectiveStatus === 'delivered' && !['reviewed', 'skipped'].includes(order.review_status) && (
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" onClick={() => {
                            console.log('🔵 GIVE REVIEW CLICKED for order:', order.id);
                            setReviewOrder(order);
                          }}>Give Review</Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            console.log('🔴 LATER CLICKED for order:', order.id);
                            skipReview.mutate(order.id);
                          }} disabled={skipReview.isPending}>Later</Button>
                        </div>
                      )}

                      {view === 'history' && (
                        <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-end">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => downloadReceipt(order)}
                            className="w-full sm:w-auto"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Receipt
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteOrder.mutate(order.id)}
                            disabled={deleteOrder.isPending}
                            className="w-full sm:w-auto"
                          >
                            Delete Order
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <ReviewOrderDialog
          open={!!reviewOrder}
          onOpenChange={(open) => !open && setReviewOrder(null)}
          order={reviewOrder}
        />
      </div>
    </ErrorBoundary>
  );
};

const ReviewOrderDialog = ({ open, onOpenChange, order }: { open: boolean; onOpenChange: (open: boolean) => void; order: any }) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Reset state when order changes
  useEffect(() => {
    if (open) {
      setRatings({});
      setComments({});
    }
  }, [open, order]);

  const submitReviews = useMutation({
    mutationFn: async () => {
      if (!user || !order) return;

      const reviews = order.order_items.map((item: any) => {
        const rating = ratings[item.product_id];
        const comment = comments[item.product_id];
        if (!rating) return null; // Skip unrated items
        return {
          product_id: item.product_id,
          user_id: user.id,
          rating,
          title: 'Order Review',
          comment: comment || '',
          is_verified_purchase: true,
          is_approved: true
        };
      }).filter(Boolean);

      if (reviews.length > 0) {
        const { error } = await (supabase as any).from('product_reviews').insert(reviews);
        if (error) throw error;
      }

      // Mark order as reviewed regardless of whether they reviewed all items
      // If they reviewed at least one, or even if they just clicked submit (maybe we should require at least one?)
      // Let's require at least one rating to submit.

      const { error: updateError } = await (supabase as any)
        .from('orders')
        .update({ review_status: 'reviewed' })
        .eq('id', order.id);
      if (updateError) throw updateError;
    },
    onSuccess: async () => {
      toast.success('Reviews submitted!');
      onOpenChange(false);
      // Force immediate refetch instead of just invalidating
      await queryClient.refetchQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit reviews');
    }
  });

  const handleRating = (productId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [productId]: rating }));
  };

  const handleComment = (productId: string, comment: string) => {
    setComments(prev => ({ ...prev, [productId]: comment }));
  };

  if (!order) return null;

  const hasAtLeastOneRating = Object.values(ratings).some(r => r > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate your Order</DialogTitle>
          <DialogDescription>
            How was your experience with these products?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="space-y-3 border-b pb-4 last:border-0">
              <div className="font-medium">{item.products?.name}</div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(item.product_id, star)}
                    className={`p-1 hover:scale-110 transition-transform ${(ratings[item.product_id] || 0) >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                      }`}
                  >
                    <Star className={`h-6 w-6 ${(ratings[item.product_id] || 0) >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="Write a review (optional)"
                value={comments[item.product_id] || ''}
                onChange={(e) => handleComment(item.product_id, e.target.value)}
                className="h-20"
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => submitReviews.mutate()}
            disabled={!hasAtLeastOneRating || submitReviews.isPending}
          >
            {submitReviews.isPending ? 'Submitting...' : 'Submit Reviews'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Orders;

const StatusTimeline = ({ status }: { status: any }) => {
  const steps = ORDER_STATUSES;
  const currentIndex = Math.max(0, steps.indexOf((status || 'pending').toLowerCase()));
  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-3 text-xs overflow-x-auto">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className={`px-1.5 sm:px-2 py-1 rounded text-xs ${i <= currentIndex ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            {STATUS_LABEL[(s as any)] || s}
          </span>
          {i < steps.length - 1 ? <span className="text-muted-foreground text-xs">›</span> : null}
        </div>
      ))}
    </div>
  );
}

const UserOrderTracking = ({ orderId }: { orderId: string }) => {
  const [positions, setPositions] = useState<Array<{ latitude: number; longitude: number }>>([]);

  // Get order status to determine if we should show live tracking
  const { data: orderStatus } = useQuery({
    queryKey: ['order-status', orderId],
    refetchInterval: 5000, // Refetch every 5 seconds to check for status changes
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('delivery_status')
        .eq('id', orderId)
        .single();
      if (error) throw error;
      return data?.delivery_status;
    }
  });

  // Get delivery request status
  const { data: deliveryRequestStatus } = useQuery({
    queryKey: ['delivery-request-status', orderId],
    refetchInterval: 5000, // Refetch every 5 seconds to check for status changes
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('delivery_requests')
        .select('status')
        .eq('order_id', orderId)
        .maybeSingle();
      if (error) throw error;
      return data?.status || null; // Return null instead of undefined
    }
  });

  // Get delivery tracking data - fetch if order is out for delivery or has a delivery partner
  const shouldTrack = orderStatus === 'out_for_delivery' || deliveryRequestStatus === 'out_for_delivery';

  // Fetch latest tracking point for current location
  const { data: trackingData } = useQuery({
    queryKey: ['delivery-tracking', orderId],
    enabled: shouldTrack, // Only fetch when order is out for delivery
    refetchInterval: shouldTrack ? 3000 : false, // Refetch every 3 seconds for faster live updates
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('delivery_tracking')
        .select('latitude, longitude, recorded_at')
        .eq('order_id', orderId)
        .order('recorded_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data as any[]) as Array<{ latitude: number; longitude: number; recorded_at: string }>;
    }
  });

  // Fetch tracking path history for route visualization (like Zomato)
  const { data: trackingPath } = useQuery({
    queryKey: ['delivery-tracking-path', orderId],
    enabled: shouldTrack, // Only fetch when order is out for delivery
    refetchInterval: shouldTrack ? 5000 : false, // Refetch every 5 seconds for path updates
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('delivery_tracking')
        .select('latitude, longitude, recorded_at')
        .eq('order_id', orderId)
        .order('recorded_at', { ascending: true })
        .limit(50); // Get last 50 points for path visualization
      if (error) throw error;
      return (data as any[]) as Array<{ latitude: number; longitude: number; recorded_at: string }>;
    }
  });

  // Get order details to find delivery partner and user address
  const { data: orderData } = useQuery({
    queryKey: ['order-details', orderId],
    refetchInterval: shouldTrack ? 3000 : 10000, // Refetch every 3 seconds when tracking, 10 seconds otherwise
    queryFn: async () => {
      // Fetch order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id, address_id, delivery_partner_id, is_order_for_someone_else, alt_drop_latitude, alt_drop_longitude')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      if (!order) return null;

      // Fetch address separately
      let address = null;
      if (order.address_id) {
        const { data: addressData } = await supabase
          .from('addresses')
          .select('latitude, longitude')
          .eq('id', order.address_id)
          .maybeSingle();
        address = addressData;
      }

      // Fetch delivery partner location separately
      let deliveryPartner = null;
      if (order.delivery_partner_id) {
        // Get delivery partner record first
        const { data: partnerRecord } = await (supabase as any)
          .from('delivery_partners')
          .select('id, latitude, longitude')
          .eq('user_id', order.delivery_partner_id)
          .maybeSingle();

        if (partnerRecord) {
          deliveryPartner = {
            latitude: partnerRecord.latitude,
            longitude: partnerRecord.longitude
          };
        }
      }

      return {
        ...order,
        addresses: address,
        delivery_partners: deliveryPartner
      };
    }
  });

  useEffect(() => {
    if (trackingData && trackingData.length > 0) {
      setPositions(trackingData);
    } else {
      setPositions([]);
    }
  }, [trackingData]);

  // Determine partner location - prefer live tracking data, fallback to delivery_partners table
  const partner = positions[0] && positions[0].latitude != null && positions[0].longitude != null
    ? { lat: positions[0].latitude, lon: positions[0].longitude }
    : orderData?.delivery_partners?.latitude != null && orderData?.delivery_partners?.longitude != null
      ? { lat: orderData.delivery_partners.latitude, lon: orderData.delivery_partners.longitude }
      : undefined;

  // Get user location from address or profile
  const userLocation = (orderData?.alt_drop_latitude != null && orderData?.alt_drop_longitude != null)
    ? { lat: orderData.alt_drop_latitude as number, lon: orderData.alt_drop_longitude as number }
    : (orderData?.addresses?.latitude && orderData?.addresses?.longitude
      ? { lat: orderData.addresses.latitude, lon: orderData.addresses.longitude }
      : undefined);

  // Only show tracking when order is out for delivery
  if (!shouldTrack) return null;

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 text-sm mb-2 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        {shouldTrack ? 'Live Tracking' : 'Order Tracking'}
        {partner && shouldTrack && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded animate-pulse">
            Live Location
          </span>
        )}
        {partner && !shouldTrack && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Partner Location
          </span>
        )}
      </div>
      {(userLocation || partner) ? (
        <LiveMap
          center={userLocation}
          partner={partner}
          height={180}
          trackingPath={trackingPath?.map(p => ({ latitude: p.latitude, longitude: p.longitude }))}
        />
      ) : (
        <div className="h-[180px] border rounded-md flex items-center justify-center bg-muted/30">
          <p className="text-sm text-muted-foreground">Waiting for location updates...</p>
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">
        {userLocation && <span>📍 Your Location</span>}
        {userLocation && partner && <span> • </span>}
        {partner && <span>🚚 Delivery Partner</span>}
        {!userLocation && !partner && shouldTrack && (
          <span className="text-orange-600">Waiting for location updates...</span>
        )}
      </div>
    </div>
  );
}
