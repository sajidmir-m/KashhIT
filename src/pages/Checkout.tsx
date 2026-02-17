import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Loader2, Search, MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';
import LiveMap from '@/components/LiveMap';
import { lookupPincode, isValidPincode } from '@/lib/pincodeLookup';
import { PincodeMap } from '@/components/PincodeMap';
import { AddressForm } from '@/components/AddressForm';
import { CouponInput } from '@/components/CouponInput';
import { reverseGeocodeOSM } from '@/lib/reverseGeocode';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isForSomeoneElse, setIsForSomeoneElse] = useState(false);
  const [altLat, setAltLat] = useState<number | null>(null);
  const [altLon, setAltLon] = useState<number | null>(null);
  const [altConfirmed, setAltConfirmed] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [altPincode, setAltPincode] = useState('');
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);
  const [pincodeData, setPincodeData] = useState<{ latitude: number; longitude: number; city: string; state: string } | null>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [altLocationLocked, setAltLocationLocked] = useState(false);
  const altReverseTimeoutRef = useRef<number | null>(null);

  const buyNowItems = (location.state as any)?.buyNow as Array<{ product: { id: string; name: string; price: number }, quantity: number }> | undefined;

  const { data: cartItems, isLoading: isLoadingCart } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: addresses } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Set default address when addresses load
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a: any) => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  // Auto-lookup pincode for "order for someone else"
  useEffect(() => {
    if (!isForSomeoneElse) {
      setAltPincode('');
      setPincodeData(null);
      setAltLocationLocked(false);
      return;
    }

    const pincode = altPincode.trim();
    
    if (!pincode) {
      setPincodeData(null);
      return;
    }

    if (isValidPincode(pincode)) {
      const lookupPincodeData = async () => {
        setIsLookingUpPincode(true);
        try {
          const data = await lookupPincode(pincode);
          
          if (data) {
            setPincodeData({
              latitude: data.latitude,
              longitude: data.longitude,
              city: data.city,
              state: data.state,
            });
            
            // Auto-set coordinates from pincode (but don't override an exact pin)
            if (!altLocationLocked) {
              setAltLat(data.latitude);
              setAltLon(data.longitude);
            }
            setAltConfirmed(false);
            
            toast.success(`Location found for pincode ${pincode}`);
          } else {
            setPincodeData(null);
            toast.error('Could not find location for this pincode');
          }
        } catch (error) {
          console.error('Pincode lookup error:', error);
          setPincodeData(null);
          toast.error('Failed to lookup pincode');
        } finally {
          setIsLookingUpPincode(false);
        }
      };

      // Debounce: wait 800ms after user stops typing
      const timeoutId = setTimeout(lookupPincodeData, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [altPincode, isForSomeoneElse, altLocationLocked]);

  // Reverse-geocode alt pin (order for someone else) to fill address/pincode
  useEffect(() => {
    if (!isForSomeoneElse) return;
    if (!altLocationLocked) return;
    if (altLat == null || altLon == null) return;

    if (altReverseTimeoutRef.current) {
      window.clearTimeout(altReverseTimeoutRef.current);
    }

    altReverseTimeoutRef.current = window.setTimeout(async () => {
      try {
        const res = await reverseGeocodeOSM(altLat, altLon);
        if (!res) return;

        if (!recipientAddress.trim() && res.displayName) {
          setRecipientAddress(res.displayName);
        }
        if (!isValidPincode(altPincode) && res.pincode) {
          setAltPincode(res.pincode);
        }
      } catch (e) {
        console.warn('Reverse geocode (alt) failed', e);
      }
    }, 700);

    return () => {
      if (altReverseTimeoutRef.current) {
        window.clearTimeout(altReverseTimeoutRef.current);
        altReverseTimeoutRef.current = null;
      }
    };
  }, [altLat, altLon, altLocationLocked, isForSomeoneElse]);

  // Load Razorpay script
  useEffect(() => {
    if (paymentMethod === 'online' && !razorpayLoaded) {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
      };
      script.onerror = () => {
        toast.error('Failed to load Razorpay. Please refresh the page.');
      };
      document.body.appendChild(script);
      return () => {
        // Only remove if script was added by this effect
        const scriptToRemove = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (scriptToRemove && scriptToRemove === script) {
          document.body.removeChild(scriptToRemove);
        }
      };
    }
  }, [paymentMethod, razorpayLoaded]);

  // Handle redirects (hooks must be at top level)
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        navigate('/auth');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  useEffect(() => {
    // Only redirect if cart is loaded and empty (and no buyNowItems)
    if (!buyNowItems && !isLoadingCart && (!cartItems || cartItems.length === 0)) {
      const timer = setTimeout(() => {
        navigate('/cart');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [buyNowItems, isLoadingCart, cartItems, navigate]);

  const computedItems = buyNowItems
    ? buyNowItems.map((bi, idx) => ({ id: `buy-${idx}`, products: bi.product, quantity: bi.quantity }))
    : (cartItems || []);

  const subtotal = computedItems.reduce((sum, item: any) => {
    const product = item.products || item.product;
    const price = product?.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0) || 0;

  const finalAmount = Math.max(0, subtotal - discountAmount);

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  // Place COD order mutation
  const placeCodOrder = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!computedItems || computedItems.length === 0) throw new Error('No items');
      if (!addresses || addresses.length === 0) throw new Error('No address');

      const selectedAddress = addresses.find((a: any) => a.id === selectedAddressId);
      if (!selectedAddress) throw new Error('No address selected');
      
      console.log('Available addresses:', addresses);
      console.log('Selected address for order:', selectedAddress);
      
      // Validate alternate location confirmation when enabled
      if (isForSomeoneElse) {
        if (!recipientName.trim()) {
          throw new Error('Please enter recipient name');
        }
        if (!recipientPhone.trim() || recipientPhone.length < 10) {
          throw new Error('Please enter a valid recipient mobile number');
        }
        if (!recipientAddress.trim()) {
          throw new Error('Please enter recipient address');
        }
        if (altLat == null || altLon == null) {
          throw new Error('Select a drop location on the map');
        }
        if (!altConfirmed) {
          throw new Error('Please confirm the selected location');
        }
      }

      const basePayload = {
        user_id: user.id,
        // For orders for someone else, we still need address_id for the order record,
        // but delivery will use recipient address
        address_id: selectedAddress.id,
        subtotal: Number(subtotal.toFixed(2)),
        discount_amount: Number(discountAmount.toFixed(2)),
        final_amount: Number(finalAmount.toFixed(2)),
        coupon_code: appliedCouponCode,
        payment_status: 'pending',
        payment_id: 'COD',
        delivery_status: 'pending',
      } as const;

      // Try inserting with optional alt drop coordinates if provided
      let order: any = null;
      try {
        const fullPayload: any = {
          ...basePayload,
          ...(isForSomeoneElse && altLat != null && altLon != null
            ? {
                is_order_for_someone_else: true,
                alt_drop_latitude: altLat,
                alt_drop_longitude: altLon,
                recipient_name: recipientName.trim(),
                recipient_phone: recipientPhone.trim(),
                recipient_address: recipientAddress.trim(),
              }
            : {}),
        };
        const { data, error } = await (supabase as any)
          .from('orders')
          .insert(fullPayload)
          .select('id')
          .single();
        if (error) throw error;
        order = data;
      } catch (e: any) {
        console.warn('Insert with alt drop fields failed, retrying without optional fields', e?.message);
        const { data, error } = await supabase
          .from('orders')
          .insert(basePayload)
          .select('id')
          .single();
        if (error) throw error;
        order = data;
      }

      const items = computedItems.map((ci: any) => {
        const product = ci.products || ci.product;
        return {
          order_id: order.id,
          product_id: product?.id,
          snapshot_name: product?.name || 'Unknown Product',
          snapshot_price: product?.price || 0,
          quantity: ci.quantity || 1,
        };
      });
      const { error: itemsErr } = await supabase.from('order_items').insert(items);
      if (itemsErr) throw itemsErr;

      // Ensure alt drop coordinates are persisted even if initial insert path skipped optional fields
      if (isForSomeoneElse && altLat != null && altLon != null) {
        try {
          console.log('Attempting to persist alt drop coords on order', order.id, { altLat, altLon });
          const { error: updErr } = await (supabase as any)
            .from('orders')
          .update({
            is_order_for_someone_else: true,
            alt_drop_latitude: altLat,
            alt_drop_longitude: altLon,
            recipient_name: recipientName.trim(),
            recipient_phone: recipientPhone.trim(),
            recipient_address: recipientAddress.trim(),
          })
          .eq('id', order.id);
          if (updErr) throw updErr;
          const { data: verify } = await (supabase as any)
            .from('orders')
            .select('is_order_for_someone_else, alt_drop_latitude, alt_drop_longitude')
            .eq('id', order.id)
            .maybeSingle();
          console.log('Order alt coords saved verification:', verify);
          if (!verify?.alt_drop_latitude || !verify?.alt_drop_longitude) {
            toast.error('Alt location not saved. Please re-try after migrations.');
          }
        } catch (e) {
          console.warn('Failed to persist alt coords on order', e);
        }
      }

      // Automatically create delivery_request for the order
      // This processes the order automatically after order creation
      // Note: delivery_requests has UNIQUE constraint on order_id, so one request per order
      // We'll use the first vendor found (or primary vendor if multiple vendors)
      try {
        // Get vendor_id from the products in this order
        const { data: orderItemsWithProducts, error: productsErr } = await supabase
          .from('order_items')
          .select('product_id, products(vendor_id)')
          .eq('order_id', order.id)
          .limit(1); // Just need one to get a vendor_id

        if (productsErr) {
          console.warn('Failed to fetch products for delivery request creation:', productsErr);
        } else if (orderItemsWithProducts && orderItemsWithProducts.length > 0) {
          const vendorId = orderItemsWithProducts[0]?.products?.vendor_id;
          
          if (vendorId) {
            // Create delivery_request (one per order due to UNIQUE constraint)
            const { error: drErr } = await (supabase as any)
              .from('delivery_requests')
              .insert({
                order_id: order.id,
                vendor_id: vendorId,
                user_id: user.id,
                status: 'pending', // Will be updated to 'approved' when vendor processes
              });
            
            if (drErr) {
              console.warn('Failed to create delivery request:', drErr);
              // Don't throw - order is already created, this is just for processing
            } else {
              console.log('Successfully created delivery request for order:', order.id);
            }
          }
        }
      } catch (e) {
        console.warn('Error creating delivery request:', e);
        // Don't throw - order is already created successfully
      }

      if (!buyNowItems) {
        const { error: clearErr } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
        if (clearErr) throw clearErr;
      }
    },
    onSuccess: () => {
      toast.success('Order placed successfully (COD)');
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      navigate('/orders');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to place order'),
  });

  // Place order after successful payment (MUST BE BEFORE CONDITIONAL RETURNS)
  const placeOnlineOrder = useMutation({
    mutationFn: async (paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      if (!user) throw new Error('Not authenticated');
      if (!computedItems || computedItems.length === 0) throw new Error('No items');
      if (!addresses || addresses.length === 0) throw new Error('No address');

      const selectedAddress = addresses.find((a: any) => a.id === selectedAddressId);
      if (!selectedAddress) throw new Error('No address selected');
      
      // Validate alternate location confirmation when enabled
      if (isForSomeoneElse) {
        if (!recipientName.trim()) {
          throw new Error('Please enter recipient name');
        }
        if (!recipientPhone.trim() || recipientPhone.length < 10) {
          throw new Error('Please enter a valid recipient mobile number');
        }
        if (!recipientAddress.trim()) {
          throw new Error('Please enter recipient address');
        }
        if (altLat == null || altLon == null) {
          throw new Error('Select a drop location on the map');
        }
        if (!altConfirmed) {
          throw new Error('Please confirm the selected location');
        }
      }

      const basePayload = {
        user_id: user.id,
        // For orders for someone else, we still need address_id for the order record,
        // but delivery will use recipient address
        address_id: selectedAddress.id,
        subtotal: Number(subtotal.toFixed(2)),
        discount_amount: Number(discountAmount.toFixed(2)),
        final_amount: Number(finalAmount.toFixed(2)),
        coupon_code: appliedCouponCode,
        payment_status: 'completed',
        payment_id: paymentData.razorpay_payment_id,
        delivery_status: 'pending',
      } as const;

      // Try inserting with optional alt drop coordinates if provided
      let order: any = null;
      try {
        const fullPayload: any = {
          ...basePayload,
          ...(isForSomeoneElse && altLat != null && altLon != null
            ? {
                is_order_for_someone_else: true,
                alt_drop_latitude: altLat,
                alt_drop_longitude: altLon,
                recipient_name: recipientName.trim(),
                recipient_phone: recipientPhone.trim(),
                recipient_address: recipientAddress.trim(),
              }
            : {}),
        };
        const { data, error } = await (supabase as any)
          .from('orders')
          .insert(fullPayload)
          .select('id')
          .single();
        if (error) throw error;
        order = data;
      } catch (e: any) {
        console.warn('Insert with alt drop fields failed, retrying without optional fields', e?.message);
        const { data, error } = await supabase
          .from('orders')
          .insert(basePayload)
          .select('id')
          .single();
        if (error) throw error;
        order = data;
      }

      const items = computedItems.map((ci: any) => {
        const product = ci.products || ci.product;
        return {
          order_id: order.id,
          product_id: product?.id,
          snapshot_name: product?.name || 'Unknown Product',
          snapshot_price: product?.price || 0,
          quantity: ci.quantity || 1,
        };
      });
      const { error: itemsErr } = await supabase.from('order_items').insert(items);
      if (itemsErr) throw itemsErr;

      // Ensure alt drop coordinates are persisted even if initial insert path skipped optional fields
      if (isForSomeoneElse && altLat != null && altLon != null) {
        try {
          console.log('Attempting to persist alt drop coords on order', order.id, { altLat, altLon });
          const { error: updErr } = await (supabase as any)
            .from('orders')
          .update({
            is_order_for_someone_else: true,
            alt_drop_latitude: altLat,
            alt_drop_longitude: altLon,
            recipient_name: recipientName.trim(),
            recipient_phone: recipientPhone.trim(),
            recipient_address: recipientAddress.trim(),
          })
          .eq('id', order.id);
          if (updErr) throw updErr;
        } catch (e) {
          console.warn('Failed to persist alt coords on order', e);
        }
      }

      // Automatically create delivery_request for the order
      // This processes the order automatically after payment confirmation
      // Note: delivery_requests has UNIQUE constraint on order_id, so one request per order
      // We'll use the first vendor found (or primary vendor if multiple vendors)
      try {
        // Get vendor_id from the products in this order
        const { data: orderItemsWithProducts, error: productsErr } = await supabase
          .from('order_items')
          .select('product_id, products(vendor_id)')
          .eq('order_id', order.id)
          .limit(1); // Just need one to get a vendor_id

        if (productsErr) {
          console.warn('Failed to fetch products for delivery request creation:', productsErr);
        } else if (orderItemsWithProducts && orderItemsWithProducts.length > 0) {
          const vendorId = orderItemsWithProducts[0]?.products?.vendor_id;
          
          if (vendorId) {
            // Create delivery_request (one per order due to UNIQUE constraint)
            const { error: drErr } = await (supabase as any)
              .from('delivery_requests')
              .insert({
                order_id: order.id,
                vendor_id: vendorId,
                user_id: user.id,
                status: 'pending', // Will be updated to 'approved' when vendor processes
              });
            
            if (drErr) {
              console.warn('Failed to create delivery request:', drErr);
              // Don't throw - order is already created, this is just for processing
            } else {
              console.log('Successfully created delivery request for order:', order.id);
            }
          }
        }
      } catch (e) {
        console.warn('Error creating delivery request:', e);
        // Don't throw - order is already created successfully
      }

      if (!buyNowItems) {
        const { error: clearErr } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
        if (clearErr) throw clearErr;
      }
    },
    onSuccess: () => {
      toast.success('Order placed successfully');
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      navigate('/orders');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to place order'),
  });

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    if (!addresses || addresses.length === 0) {
      toast.error('Please add a delivery address first');
      setIsAddressDialogOpen(true);
      return;
    }
    
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!razorpayLoaded) {
      toast.error('Payment gateway is loading. Please wait...');
      return;
    }

    if (!window.Razorpay) {
      toast.error('Payment gateway not available. Please refresh the page.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Get user session for Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please login to continue');
        navigate('/auth');
        return;
      }

      // Create Razorpay order via Edge Function
      console.log('Calling Edge Function with amount:', finalAmount);
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: finalAmount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            user_id: user?.id || '',
            order_type: buyNowItems ? 'buy_now' : 'cart',
          },
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('Edge Function response:', { orderData, orderError });

      if (orderError) {
        console.error('Edge Function error details:', orderError);
        // Try to extract error message from the error object
        const errorMessage = orderError?.message || orderError?.error || orderError?.details || 'Failed to create payment order';
        const errorDetails = orderError?.details || orderError?.error || '';
        throw new Error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
      }

      if (!orderData) {
        throw new Error('No data returned from payment service');
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Kash It Ecom',
        description: `Order for ₹${finalAmount.toFixed(2)}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // Verify payment signature (optional but recommended)
            // For now, we'll trust Razorpay's response and create the order
            await placeOnlineOrder.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (error: any) {
            toast.error(error?.message || 'Failed to process order');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          contact: addresses.find((a: any) => a.id === selectedAddressId)?.phone || '',
        },
        theme: {
          color: '#10b981', // emerald-500
        },
        // Enable UPI payment method (QR code will be shown automatically when UPI is selected)
        method: {
          upi: {
            flow: 'collect', // Shows UPI QR code and collect VPA
          },
        },
        // Enable all payment methods
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All Payment Methods',
                instruments: [
                  {
                    method: 'upi', // UPI with QR code
                  },
                  {
                    method: 'card',
                  },
                  {
                    method: 'netbanking',
                  },
                  {
                    method: 'wallet',
                  },
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Razorpay error:', error);
      toast.error(error?.message || 'Failed to initiate payment');
      setIsProcessingPayment(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!addresses || addresses.length === 0) {
      toast.error('Please add a delivery address first');
      setIsAddressDialogOpen(true);
      return;
    }
    
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    if (paymentMethod === 'cod') {
      placeCodOrder.mutate();
    } else {
      await handleRazorpayPayment();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Delivery Address</h2>
              {addresses && addresses.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedAddressId === addr.id 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm sm:text-base">{addr.label}</p>
                            {addr.is_default && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{addr.full_address}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Phone: {addr.phone}</p>
                        </div>
                        <div className="ml-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedAddressId === addr.id 
                              ? 'border-primary bg-primary' 
                              : 'border-gray-300'
                          }`}>
                            {selectedAddressId === addr.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">Please add an address.</p>
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add Delivery Address</DialogTitle>
                      </DialogHeader>
                      <AddressForm
                        onSuccess={() => {
                          setIsAddressDialogOpen(false);
                          queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
                        }}
                        onCancel={() => setIsAddressDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </Card>

            {/* Order for Someone Else */}
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Order for Someone Else</h2>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isForSomeoneElse}
                    onChange={(e) => setIsForSomeoneElse(e.target.checked)}
                  />
                  Enable
                </label>
              </div>
              {isForSomeoneElse && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Please add the delivery details for the person you are ordering for.</p>
                  </div>
                  
                  {/* Recipient Details Form */}
                  <div className="space-y-3 border-t pt-3">
                    <h3 className="font-semibold text-sm sm:text-base">Recipient Details</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recipient-name">Recipient Name *</Label>
                      <Input
                        id="recipient-name"
                        placeholder="Enter recipient's full name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recipient-phone">Recipient Mobile Number *</Label>
                      <Input
                        id="recipient-phone"
                        placeholder="Enter recipient's mobile number"
                        value={recipientPhone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setRecipientPhone(value);
                        }}
                        maxLength={10}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recipient-address">Area / Full Address *</Label>
                      <Textarea
                        id="recipient-address"
                        placeholder="Enter complete delivery address (house number, street, area, landmark)"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">Enter pincode to auto-locate, or click on the map to choose the delivery point.</p>
                  
                    {/* Pincode Input */}
                    <div className="space-y-2">
                    <Label htmlFor="alt-pincode">Delivery Pincode</Label>
                    <div className="relative">
                      <Input
                        id="alt-pincode"
                        placeholder="Enter 6-digit pincode"
                        value={altPincode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setAltLocationLocked(false); // allow map to follow pincode center if user edits pincode
                          setAltPincode(value);
                        }}
                        maxLength={6}
                        className={isLookingUpPincode ? 'pr-10' : ''}
                      />
                      {isLookingUpPincode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {altPincode.length === 6 && !isLookingUpPincode && !pincodeData && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {altPincode.length > 0 && altPincode.length < 6 && (
                      <p className="text-xs text-muted-foreground">
                        Enter 6-digit pincode to auto-locate on map
                      </p>
                    )}
                    </div>

                    {/* Show Map from Pincode */}
                    {pincodeData && altPincode.length === 6 && (
                      <div className="space-y-2">
                        <PincodeMap
                          latitude={pincodeData.latitude}
                          longitude={pincodeData.longitude}
                          pincode={altPincode}
                          city={pincodeData.city}
                          state={pincodeData.state}
                          height={200}
                        />
                        <p className="text-xs text-muted-foreground">
                          📍 Location: {pincodeData.city}, {pincodeData.state} - {altPincode}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                            if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
                            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
                          });
                          const lat = pos.coords.latitude;
                          const lon = pos.coords.longitude;
                          setAltLocationLocked(true);
                          setAltLat(lat);
                          setAltLon(lon);
                          setAltConfirmed(false);
                          toast.success('Location detected');
                        } catch (e: any) {
                          toast.error(e?.message || 'Failed to detect location');
                        }
                      }}
                    >
                      Use Current Location
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (altLat == null || altLon == null) {
                          toast.error('Select a location first');
                          return;
                        }
                        setAltConfirmed(true);
                        toast.success('Location confirmed');
                      }}
                      disabled={altLat == null || altLon == null || altConfirmed}
                    >
                      {altConfirmed ? 'Location Confirmed' : 'Confirm Location'}
                    </Button>
                    </div>
                    <LiveMap
                      selectable
                      height={260}
                      selected={altLat != null && altLon != null ? { lat: altLat, lon: altLon } : undefined}
                      onSelect={(coords) => {
                        setAltLocationLocked(true);
                        setAltLat(coords.lat);
                        setAltLon(coords.lon);
                        setAltConfirmed(false);
                      }}
                    />
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Selected: {altLat != null && altLon != null ? `${altLat.toFixed(6)}, ${altLon.toFixed(6)}` : '—'} {altConfirmed && <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-800">Confirmed</span>}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Order Items</h2>
              <div className="space-y-2 sm:space-y-3">
                {computedItems && computedItems.length > 0 ? (
                  computedItems.map((item: any, index: number) => {
                    const product = item.products || item.product;
                    const quantity = item.quantity || 1;
                    const price = product?.price || 0;
                    const itemId = item.id || `item-${index}`;
                    
                    return (
                      <div key={itemId} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 border rounded-lg">
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base break-words">{product?.name || 'Unknown Product'}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Quantity: {quantity}</p>
                        </div>
                        <span className="font-bold text-sm sm:text-base whitespace-nowrap">₹{(price * quantity).toFixed(2)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <p className="text-muted-foreground text-sm sm:text-base">No items to checkout</p>
                    <Button onClick={() => navigate('/products')} className="mt-3 sm:mt-4 w-full sm:w-auto">Browse Products</Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:order-last">
            <Card className="p-3 sm:p-4 md:p-6 sticky top-20">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Payment Summary</h2>
              
              <div className="space-y-2 mb-3 sm:mb-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm sm:text-base text-green-600">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-semibold">₹0.00</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-semibold">₹0.00</span>
                </div>
              </div>

              <div className="border-t pt-3 sm:pt-4 mb-3 sm:mb-4">
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{finalAmount.toFixed(2)}</span>
                </div>
              </div>

              <CouponInput
                subtotal={subtotal}
                onCouponApplied={(discount, code) => {
                  setDiscountAmount(discount);
                  setAppliedCouponCode(code);
                }}
                onCouponRemoved={() => {
                  setDiscountAmount(0);
                  setAppliedCouponCode(null);
                }}
              />

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <h3 className="font-semibold text-sm sm:text-base">Payment Method</h3>
                <label className="flex items-center gap-2 text-xs sm:text-sm">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  Cash on Delivery (COD)
                </label>
                <label className="flex items-center gap-2 text-xs sm:text-sm">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                  Online Payment (Razorpay)
                </label>
              </div>

              <Button 
                size="lg" 
                className="w-full text-sm sm:text-base" 
                onClick={handlePlaceOrder}
                disabled={isProcessingPayment || placeCodOrder.isPending || placeOnlineOrder.isPending || (paymentMethod === 'online' && !razorpayLoaded)}
              >
                {paymentMethod === 'cod' 
                  ? (placeCodOrder.isPending ? 'Placing…' : 'Place Order (COD)') 
                  : (isProcessingPayment || placeOnlineOrder.isPending 
                    ? 'Processing…' 
                    : razorpayLoaded 
                      ? 'Pay Now' 
                      : 'Loading Payment...')}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
