import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, TrendingUp, PlusCircle, Upload, Check, Truck, Download, MapPin, X, Trash2, Images } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCurrentPosition } from '@/lib/utils';
import { STATUS_LABEL, ORDER_STATUSES } from '@/lib/orderStatus';
import { deleteProductImage } from '@/lib/deleteProductImage';
import React from 'react';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { NotificationBell } from '@/components/NotificationBell';
import { LocationPickerMap } from '@/components/LocationPickerMap';
import { Save } from 'lucide-react';

const VendorDashboard = () => {
  const { userRoles, user, loading } = useAuth();
  const navigate = useNavigate();
  const notifications = useOrderNotifications(userRoles.includes('vendor') ? 'vendor' : null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"><span className="text-sm text-muted-foreground">Loading…</span></div>
    );
  }

  if (!loading && !userRoles.includes('vendor')) {
    return <Navigate to="/vendor/auth" replace />;
  }

  const [activeSection, setActiveSection] = useState<string>('vendor-orders');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Vendor Dashboard</h1>
          {userRoles.includes('vendor') && (
            <NotificationBell
              notifications={notifications.notifications}
              unreadCount={notifications.unreadCount}
              onMarkAsRead={notifications.markAsRead}
              onMarkAllAsRead={notifications.markAllAsRead}
              onClear={notifications.clearNotifications}
            />
          )}
        </div>
        <VendorSectionNav activeSection={activeSection} onChange={setActiveSection} />
        <div className="h-2 sm:h-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {activeSection === 'vendor-location' && (
            <Card id="vendor-location" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Shop Location</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <VendorLocationCard userId={user?.id ?? null} />
              </CardContent>
            </Card>
          )}

          {activeSection === 'vendor-products' && (
            <Card id="vendor-products" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    <CardTitle className="text-lg sm:text-xl">My Products</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <VendorProductsList userId={user?.id ?? null} />
              </CardContent>
            </Card>
          )}

          {activeSection === 'vendor-add-product' && (
            <Card id="vendor-add-product" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Add New Product</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <AddProductForm userId={user?.id ?? null} />
              </CardContent>
            </Card>
          )}

          {activeSection === 'vendor-stats' && (
            <Card id="vendor-stats" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Stats</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-bold">₹0</p>
              </CardContent>
            </Card>
          )}

          {activeSection === 'vendor-orders' && (
            <Card id="vendor-orders" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Orders</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <VendorOrders userId={user?.id ?? null} view="live" />
              </CardContent>
            </Card>
          )}

          {activeSection === 'vendor-orders-history' && (
            <Card id="vendor-orders-history" className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <CardTitle className="text-lg sm:text-xl">Order History</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <VendorOrders userId={user?.id ?? null} view="history" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

const VendorSectionNav = ({ activeSection, onChange }: { activeSection: string; onChange: (id: string) => void }) => {
  const sections = [
    { id: 'vendor-location', label: 'Location', icon: MapPin },
    { id: 'vendor-products', label: 'Products', icon: Package },
    { id: 'vendor-add-product', label: 'Add', icon: PlusCircle },
    { id: 'vendor-orders', label: 'Orders', icon: Truck },
    { id: 'vendor-orders-history', label: 'History', icon: Truck },
    { id: 'vendor-stats', label: 'Stats', icon: TrendingUp },
  ];
  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="rounded-xl border bg-card shadow-sm p-2 sm:p-3">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 sm:gap-2">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Button
                key={s.id}
                variant={activeSection === s.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(s.id)}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto"
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline sm:inline">{s.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const VendorLocationCard = ({ userId }: { userId: string | null }) => {
  const queryClient = useQueryClient();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor-location', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('vendors')
        .select('id, latitude, longitude')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; latitude: number | null; longitude: number | null } | null;
    },
  });

  // Initialize coords when vendor data loads
  useEffect(() => {
    if (vendor?.latitude && vendor?.longitude) {
      setCoords({ lat: vendor.latitude, lon: vendor.longitude });
    }
  }, [vendor]);

  const setLocation = useMutation({
    mutationFn: async () => {
      if (!vendor?.id) throw new Error('Vendor profile not found');
      if (!coords) throw new Error('No location selected');

      const { error } = await (supabase as any)
        .from('vendors')
        .update({ latitude: coords.lat, longitude: coords.lon })
        .eq('id', vendor.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Shop location updated');
      queryClient.invalidateQueries({ queryKey: ['vendor-location', userId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-orders', vendor?.id] });
      // Also invalidate order details to ensure delivery partners get fresh coordinates
      queryClient.invalidateQueries({ queryKey: ['order-details'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to set location'),
  });

  if (!userId) return <p className="text-sm text-muted-foreground">Sign in to manage location.</p>;
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!vendor) return <p className="text-sm text-muted-foreground">No vendor profile found.</p>;

  const hasLocation = vendor.latitude != null && vendor.longitude != null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="text-sm">
          <div className="font-medium mb-1">Status: {hasLocation ? 'Location set' : 'Not set'}</div>
          {hasLocation ? (
            <div className="text-xs text-muted-foreground break-all">
              Saved: {vendor.latitude?.toFixed(6)}, {vendor.longitude?.toFixed(6)}
              <br />
              <span className="text-green-600">✓ Ready for delivery assignment</span>
            </div>
          ) : (
            <div className="text-xs text-destructive">Vendor location is required for assignment</div>
          )}
        </div>

        <LocationPickerMap
          latitude={coords?.lat}
          longitude={coords?.lon}
          onLocationSelect={(lat, lon) => setCoords({ lat, lon })}
          height={300}
        />

        <div className="flex items-center justify-between bg-muted p-3 rounded-md">
          <div className="text-xs text-muted-foreground">
            {coords ? (
              <>Selected: {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}</>
            ) : (
              'No location selected yet'
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setLocation.mutate()}
            disabled={setLocation.isPending || !coords}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {setLocation.isPending ? 'Saving...' : 'Save Location'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const AddProductForm = ({ userId }: { userId: string | null }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [unit, setUnit] = useState('piece');
  const [stock, setStock] = useState('0');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Highlights section fields
  const [brand, setBrand] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');

  // Main Information section fields
  const [disclaimer, setDisclaimer] = useState('');
  const [customerCareDetails, setCustomerCareDetails] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [sellerLicenseNo, setSellerLicenseNo] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [shelfLife, setShelfLife] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Array<{ id: string; name: string }>;
    },
  });

  const { data: vendor } = useQuery({
    queryKey: ['vendor-profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string } | null;
    },
  });

  const createProduct = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      if (!vendor?.id) throw new Error('Vendor profile not found');
      if (!categoryId) throw new Error('Select a category');
      if (!name || !price) throw new Error('Name and price are required');

      let imageUrl: string | null = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const path = `${vendor.id}/${Date.now()}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(path, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadErr) throw uploadErr;
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      const { error } = await (supabase as any).rpc('create_product', {
        p_category_id: categoryId || null,
        p_name: name.trim(),
        p_description: description.trim() || null,
        p_price: parseFloat(price) || 0,
        p_stock: parseInt(stock || '0', 10),
        p_unit: unit.trim() || null,
        p_image_url: imageUrl,
        p_brand: brand.trim() || null,
        p_dietary_preference: dietaryPreference.trim() || null,
        p_key_features: keyFeatures.trim() || null,
        p_disclaimer: disclaimer.trim() || null,
        p_customer_care_details: customerCareDetails.trim() || null,
        p_seller_name: sellerName.trim() || null,
        p_seller_address: sellerAddress.trim() || null,
        p_seller_license_no: sellerLicenseNo.trim() || null,
        p_country_of_origin: countryOfOrigin.trim() || null,
        p_shelf_life: shelfLife.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product submitted for approval');
      setName('');
      setPrice('');
      setCategoryId('');
      setUnit('piece');
      setStock('0');
      setDescription('');
      setImageFile(null);
      setBrand('');
      setDietaryPreference('');
      setKeyFeatures('');
      setDisclaimer('');
      setCustomerCareDetails('');
      setSellerName('');
      setSellerAddress('');
      setSellerLicenseNo('');
      setCountryOfOrigin('');
      setShelfLife('');
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
    },
    onError: () => toast.error('Failed to add product'),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Product Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tomatoes" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Price</label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="100" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Unit</label>
          <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="piece / kg / pack" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Stock</label>
          <Input value={stock} onChange={(e) => setStock(e.target.value)} type="number" min="0" step="1" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Image</label>
          <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product" />
      </div>

      {/* Highlights Section */}
      <div className="border-t pt-4 mt-6">
        <h3 className="text-lg font-semibold mb-4">Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Enter brand name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dietary Preference</label>
            <Input value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value)} placeholder="e.g., Vegetarian, Vegan, Gluten-free" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Key Features</label>
            <Textarea value={keyFeatures} onChange={(e) => setKeyFeatures(e.target.value)} placeholder="Enter key features (one per line or comma separated)" rows={3} />
          </div>
        </div>
      </div>

      {/* Main Information Section */}
      <div className="border-t pt-4 mt-6">
        <h3 className="text-lg font-semibold mb-4">Main Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Seller Name</label>
            <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Enter seller name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Seller License No.</label>
            <Input value={sellerLicenseNo} onChange={(e) => setSellerLicenseNo(e.target.value)} placeholder="Enter license number" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Seller Address</label>
            <Textarea value={sellerAddress} onChange={(e) => setSellerAddress(e.target.value)} placeholder="Enter seller address" rows={2} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Country of Origin</label>
            <Input value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} placeholder="e.g., India" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shelf Life</label>
            <Input value={shelfLife} onChange={(e) => setShelfLife(e.target.value)} placeholder="e.g., 6 months" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Disclaimer</label>
            <Textarea value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} placeholder="Enter disclaimer information" rows={2} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Customer Care Details</label>
            <Textarea value={customerCareDetails} onChange={(e) => setCustomerCareDetails(e.target.value)} placeholder="Enter customer care contact details" rows={2} />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={createProduct.isPending}>
        <Upload className="h-4 w-4 mr-2" /> {createProduct.isPending ? 'Saving…' : 'Submit for Approval'}
      </Button>
    </form>
  );
};

const VendorOrders = ({ userId, view = 'live' }: { userId: string | null; view?: 'live' | 'history' }) => {
  const { data: vendor } = useQuery({
    queryKey: ['vendor-location', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('vendors')
        .select('id, latitude, longitude')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; latitude: number | null; longitude: number | null } | null;
    },
  });

  // Cache vendor products separately to avoid refetching on every orders query
  const { data: vendorProducts } = useQuery({
    queryKey: ['vendor-products-ids', vendor?.id],
    enabled: !!vendor?.id,
    queryFn: async () => {
      if (!vendor?.id) return [];
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('vendor_id', vendor.id);
      if (error) throw error;
      return (data || []).map(p => p.id) as string[];
    },
    staleTime: 60000, // Cache product IDs for 1 minute (they don't change often)
    refetchOnWindowFocus: false,
  });

  const { data: orders, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vendor-orders', vendor?.id],
    enabled: !!vendor?.id && !!vendorProducts && vendorProducts.length > 0,
    retry: 2, // Retry failed queries up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    queryFn: async () => {
      if (!vendor?.id || !vendorProducts || vendorProducts.length === 0) {
        return [];
      }

      // Limit product IDs to prevent query size issues (Supabase has limits)
      const limitedProductIds = vendorProducts.slice(0, 1000); // Max 1000 products per query

      // Run parallel queries for better performance with timeout protection
      const queryTimeout = 30000; // 30 second timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), queryTimeout)
      );

      const [orderItemsResult, visibilityResult] = await Promise.race([
        Promise.allSettled([
          // Get orders that have items from this vendor's products
          supabase
            .from('order_items')
            .select('order_id, id, product_id, quantity, snapshot_name, snapshot_price')
            .in('product_id', limitedProductIds),
          // Get order visibility in parallel
          (supabase as any)
            .from('order_visibility')
            .select('order_id, is_visible')
            .eq('user_id', userId)
            .eq('user_type', 'vendor'),
        ]),
        timeoutPromise,
      ]) as PromiseSettledResult<any>[];

      // Handle order items result with error protection
      if (orderItemsResult.status === 'rejected' || !orderItemsResult.value?.data) {
        const error = orderItemsResult.status === 'rejected'
          ? orderItemsResult.reason
          : orderItemsResult.value?.error;
        // Error logged securely without exposing sensitive data
        throw error || new Error('Failed to fetch order items');
      }

      const orderItems = orderItemsResult.value.data;
      if (!orderItems || orderItems.length === 0) {
        return [];
      }

      // Limit order items to prevent memory issues
      const maxOrderItems = 10000;
      const limitedOrderItems = orderItems.slice(0, maxOrderItems);

      // Get unique order IDs and pre-group order items by order_id for O(1) lookup
      const orderIds = [...new Set(limitedOrderItems.map(oi => oi.order_id))];

      // Limit order IDs to prevent query size issues
      const maxOrderIds = 1000;
      const limitedOrderIds = orderIds.slice(0, maxOrderIds);

      const orderItemsByOrderId = new Map<string, typeof limitedOrderItems>();
      for (const item of limitedOrderItems) {
        if (limitedOrderIds.includes(item.order_id)) {
          const existing = orderItemsByOrderId.get(item.order_id) || [];
          orderItemsByOrderId.set(item.order_id, [...existing, item]);
        }
      }

      // Handle visibility result (non-critical)
      const visibilityData = visibilityResult.status === 'fulfilled'
        ? visibilityResult.value.data
        : null;

      // Filter out hidden orders
      const hiddenOrderIds = new Set(
        (visibilityData as any[])?.filter((v: any) => !v.is_visible).map((v: any) => v.order_id) || []
      );

      const visibleOrderIds = limitedOrderIds.filter(id => !hiddenOrderIds.has(id));

      if (visibleOrderIds.length === 0) {
        return [];
      }

      // Get the actual orders with limit protection
      const { data: basicOrders, error: basicError } = await supabase
        .from('orders')
        .select('*')
        .in('id', visibleOrderIds as string[])
        .order('created_at', { ascending: false })
        .limit(500); // Limit to 500 orders max to prevent database overload

      if (basicError) {
        // Error logged securely without exposing sensitive data
        throw basicError;
      }

      if (!basicOrders || basicOrders.length === 0) {
        return [];
      }

      // Batch fetch all related data in parallel with limits
      const uniqueUserIds = [...new Set(basicOrders.map(o => o.user_id))].slice(0, 500);
      const uniqueAddressIds = [...new Set(basicOrders.map(o => o.address_id).filter(Boolean))].slice(0, 500);

      const batchQueriesPromise = Promise.allSettled([
        // Batch fetch profiles
        uniqueUserIds.length > 0
          ? supabase
            .from('profiles')
            .select('id, full_name, phone')
            .in('id', uniqueUserIds)
          : Promise.resolve({ data: [], error: null }),
        // Batch fetch addresses
        uniqueAddressIds.length > 0
          ? supabase
            .from('addresses')
            .select('id, label, full_address, city, state, pincode, phone')
            .in('id', uniqueAddressIds)
          : Promise.resolve({ data: [], error: null }),
        // Batch fetch delivery requests
        (supabase as any)
          .from('delivery_requests')
          .select('order_id, status')
          .in('order_id', visibleOrderIds.slice(0, 500)), // Limit to 500
      ]);

      const [profilesResult, addressesResult, deliveryRequestsResult] = await Promise.race([
        batchQueriesPromise,
        timeoutPromise,
      ]) as PromiseSettledResult<any>[];

      // Extract data from results (non-critical errors are handled)
      const profilesData = profilesResult.status === 'fulfilled'
        ? profilesResult.value.data
        : [];
      const addressesData = addressesResult.status === 'fulfilled'
        ? addressesResult.value.data
        : [];
      const deliveryRequestsData = deliveryRequestsResult.status === 'fulfilled'
        ? deliveryRequestsResult.value.data
        : [];

      // Create lookup maps for O(1) access
      const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));
      const addressesMap = new Map((addressesData || []).map(a => [a.id, a]));
      const deliveryRequestsMap = new Map((deliveryRequestsData || []).map((dr: any) => [dr.order_id, dr]));

      // Process orders with details using batched data and pre-grouped order items
      const ordersWithDetails = basicOrders.map((order) => {
        // Get order items from pre-grouped map (O(1) instead of O(n) filter)
        const orderOrderItems = orderItemsByOrderId.get(order.id) || [];

        return {
          ...order,
          profiles: profilesMap.get(order.user_id) || null,
          addresses: order.address_id ? (addressesMap.get(order.address_id) || null) : null,
          order_items: orderOrderItems.map(oi => ({
            ...oi,
            products: { vendor_id: vendor.id }
          })),
          delivery_requests: deliveryRequestsMap.get(order.id)
            ? { status: (deliveryRequestsMap.get(order.id) as any).status }
            : null,
        };
      });

      return ordersWithDetails as Array<{
        id: string;
        created_at: string;
        delivery_status: string | null;
        final_amount: number;
        user_id: string;
        address_id: string;
        profiles: { id: string; full_name: string; phone: string | null } | null;
        addresses: { id: string; label: string; full_address: string; city: string; state: string; pincode: string; phone: string | null } | null;
        order_items: Array<{ id: string; product_id: string | null; quantity: number; snapshot_name: string; snapshot_price: number; products: { vendor_id: string } | null }>;
      }>;
    },
    // Optimize refetching - allow immediate refetching for new orders
    staleTime: 0, // Consider data stale immediately to allow refetching
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchInterval: 10000, // Fallback polling every 10 seconds in case realtime events are missed
    refetchOnWindowFocus: true, // Refetch on window focus to catch missed updates
    refetchOnMount: true, // Refetch on mount
    refetchOnReconnect: true, // Refetch on reconnect to catch missed updates
    networkMode: 'online', // Only refetch when online
  });

  const queryClient = useQueryClient();

  // Debounce function to prevent rapid invalidations with rate limiting
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastInvalidationRef = React.useRef<number>(0);
  const MIN_INVALIDATION_INTERVAL = 1000; // Minimum 1 second between invalidations (reduced from 2s)

  // Immediate invalidation and refetch for new orders (no rate limiting)
  const immediateInvalidate = React.useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    // Invalidate and force immediate refetch for new orders
    lastInvalidationRef.current = Date.now();
    // Force immediate refetch - this ensures new orders appear
    try {
      await refetch();
    } catch (error) {
      // If refetch fails, try invalidating and refetching via queryClient
      await queryClient.invalidateQueries({ queryKey: ['vendor-orders', vendor?.id] });
      await queryClient.refetchQueries({ queryKey: ['vendor-orders', vendor?.id] });
    }
  }, [queryClient, vendor?.id, refetch]);

  // Debounced invalidation for updates (with rate limiting)
  const debouncedInvalidate = React.useCallback(() => {
    const now = Date.now();
    const timeSinceLastInvalidation = now - lastInvalidationRef.current;

    // Rate limit: don't invalidate more than once every 1 second
    if (timeSinceLastInvalidation < MIN_INVALIDATION_INTERVAL) {
      return; // Skip this invalidation
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      lastInvalidationRef.current = Date.now();
      queryClient.invalidateQueries({ queryKey: ['vendor-orders', vendor?.id] });
    }, 500); // Debounce for 500ms (reduced from 1s)
  }, [queryClient, vendor?.id]);

  useEffect(() => {
    if (!vendor?.id) return;

    let isSubscribed = true;
    let channel: any = null;

    try {
      // Use a more targeted approach to avoid RLS recursion
      // Listen to order_items, delivery_requests, and orders changes
      // This ensures payment status updates are reflected immediately
      channel = supabase
        .channel(`orders-vendor-${vendor.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'order_items'
        }, (payload) => {
          // New order item created - refetch immediately to show new orders
          if (isSubscribed) {
            // Add small delay to ensure order is fully created, then refetch
            setTimeout(() => {
              refetch();
            }, 1000);
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_items'
        }, () => {
          // Order item updated - use debounced invalidation
          if (isSubscribed) {
            debouncedInvalidate();
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'delivery_requests'
        }, () => {
          if (isSubscribed) {
            debouncedInvalidate();
          }
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        }, (payload) => {
          // New order created - refetch immediately to show new order
          if (isSubscribed) {
            // Add delay to ensure order_items are created, then refetch
            setTimeout(() => {
              refetch();
            }, 1500);
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        }, (payload) => {
          // Only invalidate if payment_status or delivery_status actually changed
          const oldStatus = (payload.old as any)?.payment_status;
          const newStatus = (payload.new as any)?.payment_status;
          const oldDeliveryStatus = (payload.old as any)?.delivery_status;
          const newDeliveryStatus = (payload.new as any)?.delivery_status;

          if (isSubscribed && (oldStatus !== newStatus || oldDeliveryStatus !== newDeliveryStatus)) {
            // Use debounced invalidation - let React Query handle it naturally
            debouncedInvalidate();
          }
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            // Subscription successful - realtime is now active
          } else if (status === 'CHANNEL_ERROR') {
            // Realtime subscription error - handled silently
            // Fallback: try to resubscribe after a delay
            setTimeout(() => {
              if (isSubscribed && channel) {
                channel.subscribe();
              }
            }, 5000);
          } else if (status === 'TIMED_OUT') {
            // Subscription timed out - resubscribe
            if (isSubscribed && channel) {
              channel.subscribe();
            }
          }
        });
    } catch (error) {
      // Error setting up realtime subscription - handled silently
    }

    return () => {
      isSubscribed = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          // Error removing channel - handled silently
        }
      }
    };
  }, [vendor?.id, queryClient, debouncedInvalidate, immediateInvalidate, refetch]);
  const [hiddenOrderIds, setHiddenOrderIds] = useState<string[]>([] as string[]);
  const HIDDEN_VENDOR_ORDERS_KEY = 'hiddenVendorOrderIds';

  // Persist hidden orders across refresh so deleted items don't reappear
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HIDDEN_VENDOR_ORDERS_KEY) || '[]');
      if (Array.isArray(saved)) setHiddenOrderIds(saved);
    } catch { }
  }, []);

  const persistHidden = (next: string[]) => {
    setHiddenOrderIds(next);
    try { localStorage.setItem(HIDDEN_VENDOR_ORDERS_KEY, JSON.stringify(next)); } catch { }
  };
  const assignNearest = useMutation({
    mutationFn: async (orderId: string) => {
      // Then, request backend to assign nearest partner (should set assigned server-side)
      const { data: rpcData, error: rpcErr } = await (supabase as any).rpc('assign_nearest_partner', { p_order_id: orderId });
      if (rpcErr) throw rpcErr;

      // After assignment, set orders.delivery_partner_id so partner can update order per RLS
      // 1) Get assigned partner (delivery_partners.id)
      const { data: reqRow, error: reqErr } = await (supabase as any)
        .from('delivery_requests')
        .select('assigned_partner_id')
        .eq('order_id', orderId)
        .maybeSingle();
      if (reqErr) throw reqErr;
      const assignedPartnerId = (reqRow as any)?.assigned_partner_id;
      if (assignedPartnerId) {
        // 2) Map to profiles.id (delivery_partners.user_id)
        const { data: partnerRow, error: partnerErr } = await supabase
          .from('delivery_partners')
          .select('user_id')
          .eq('id', assignedPartnerId)
          .maybeSingle();
        if (partnerErr) throw partnerErr;
        if (partnerRow?.user_id) {
          const { error: updOrderErr } = await supabase
            .from('orders')
            .update({ delivery_partner_id: partnerRow.user_id as any, delivery_status: 'assigned' as any })
            .eq('id', orderId);
          if (updOrderErr) throw updOrderErr;
        }
      }

      return { ok: true } as const;
    },
    onMutate: async (orderId: string) => {
      await queryClient.cancelQueries({ queryKey: ['vendor-orders', vendor?.id] });
      const prev = queryClient.getQueryData<any[]>(['vendor-orders', vendor?.id]) || [];
      // Optimistically leave status unchanged; assignment will reflect after RPC
      const next = prev;
      queryClient.setQueryData(['vendor-orders', vendor?.id], next);
      return { prev } as { prev: any[] };
    },
    onError: (_err: any, _orderId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['vendor-orders', vendor?.id], ctx.prev);
      // Error handled securely without exposing details
      toast.error('Failed to assign partner');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders', vendor?.id] });
      toast.success('Assigned to nearest delivery partner');
    },
  });

  const rejectOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await (supabase as any).rpc('vendor_reject_order', { p_order_id: orderId });
      if (error) {
        throw error;
      }
    },
    onMutate: async (orderId: string) => {
      await queryClient.cancelQueries({ queryKey: ['vendor-orders', vendor?.id] });
      const prevVendorOrders = queryClient.getQueryData<any[]>(['vendor-orders', vendor?.id]) || [];

      // Always mark as cancelled (never remove) - rejected orders should appear in history
      const nextVendorOrders = prevVendorOrders.map(order =>
        order.id === orderId ? { ...order, delivery_status: 'cancelled' } : order
      );
      queryClient.setQueryData(['vendor-orders', vendor?.id], nextVendorOrders);

      // Update order status in all user orders
      queryClient.setQueriesData({ queryKey: ['orders'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((order: any) =>
          order.id === orderId ? { ...order, delivery_status: 'cancelled' } : order
        );
      });

      return { prevVendorOrders };
    },
    onSuccess: () => {
      // Invalidate vendor orders
      queryClient.invalidateQueries({ queryKey: ['vendor-orders', vendor?.id] });

      // Invalidate all user orders queries (for all users)
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Invalidate any delivery requests queries
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });

      // Force refetch of all order-related queries
      queryClient.refetchQueries({ queryKey: ['orders'] });
      queryClient.refetchQueries({ queryKey: ['vendor-orders'] });

      toast.success('Order rejected successfully.');
    },
    onError: (e: any, _orderId, context) => {
      // Revert optimistic updates on error
      if (context?.prevVendorOrders) {
        queryClient.setQueryData(['vendor-orders', vendor?.id], context.prevVendorOrders);

        // Revert user orders as well
        queryClient.setQueriesData({ queryKey: ['orders'] }, (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((order: any) =>
            order.id === _orderId ? context.prevVendorOrders.find((o: any) => o.id === _orderId) || order : order
          );
        });
      }
      // Error message sanitized - no sensitive data exposed
      toast.error('Failed to reject order');
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await (supabase as any).rpc('vendor_delete_order_fixed', { p_order_id: orderId });
      if (error) {
        throw error;
      }
    },
    onSuccess: (_, orderId) => {
      toast.success('Order removed from your history');
      persistHidden(Array.from(new Set([...(hiddenOrderIds || []), orderId as string])));
      queryClient.invalidateQueries({ queryKey: ['vendor-orders', vendor?.id] });
    },
    onError: () => {
      toast.error('Failed to remove order from history');
    },
  });

  const testVendorAccess = useMutation({
    mutationFn: async () => {
      // Test profile access
      const { data: profileTest, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .limit(1);

      // Test address access
      const { data: addressTest, error: addressError } = await supabase
        .from('addresses')
        .select('id, label, full_address')
        .limit(1);

      return {
        profileTest: { data: profileTest, error: profileError },
        addressTest: { data: addressTest, error: addressError }
      };
    },
    onSuccess: (data) => {
      // Access test results shown to user without exposing sensitive data
      toast.success(`Profile access: ${data.profileTest.error ? 'FAILED' : 'SUCCESS'}, Address access: ${data.addressTest.error ? 'FAILED' : 'SUCCESS'}`);
    },
    onError: () => {
      toast.error('Vendor access test failed');
    },
  });

  // Memoize the split operation BEFORE any early returns to follow React Hooks rules
  const { live: liveOrders, history: historyOrders } = useMemo(() => {
    if (!orders || orders.length === 0) {
      return { live: [], history: [] };
    }

    const live: any[] = [];
    const history: any[] = [];

    for (const o of orders) {
      const deliveryRequestStatus = (o as any).delivery_requests?.status as string | null;
      const orderStatus = o.delivery_status as string | null;

      // Check both delivery_requests.status and orders.delivery_status for delivered/cancelled
      const isDelivered = deliveryRequestStatus === 'delivered' || orderStatus === 'delivered';
      const isCancelled = deliveryRequestStatus === 'cancelled' || orderStatus === 'cancelled';

      if (isDelivered || isCancelled) {
        history.push(o);
      } else {
        live.push(o);
      }
    }

    return { live, history };
  }, [orders]);

  const downloadReceipt = (order: any) => {
    // Get vendor details
    const vendorDetails = {
      businessName: "KashIT E-Commerce", // Your company name
      address: "123 Business Street, Tech City, TC 12345",
      phone: "+1 (555) 123-4567",
      email: "orders@kashit.com",
      website: "www.kashit.com"
    };

    // Create receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - Order ${order.id.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .receipt { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          .company-details { color: #666; font-size: 14px; }
          .invoice-title { font-size: 24px; font-weight: bold; color: #333; margin: 20px 0; }
          .order-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .order-details, .customer-details { flex: 1; }
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
          .status-pending { background-color: #fef3c7; color: #92400e; }
          .status-assigned { background-color: #dbeafe; color: #1e40af; }
          .status-out_for_delivery { background-color: #e0e7ff; color: #5b21b6; }
          .status-delivered { background-color: #d1fae5; color: #065f46; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="company-name">${vendorDetails.businessName}</div>
            <div class="company-details">
              ${vendorDetails.address}<br>
              Phone: ${vendorDetails.phone} | Email: ${vendorDetails.email}<br>
              Website: ${vendorDetails.website}
            </div>
          </div>

          <div class="invoice-title">INVOICE</div>

          <div class="order-info">
            <div class="order-details">
              <div class="section-title">Order Information</div>
              <div class="info-row"><span class="label">Order ID:</span> <span class="value">#${order.id.slice(0, 8)}</span></div>
              <div class="info-row"><span class="label">Order Date:</span> <span class="value">${new Date(order.created_at).toLocaleDateString()}</span></div>
              <div class="info-row"><span class="label">Order Time:</span> <span class="value">${new Date(order.created_at).toLocaleTimeString()}</span></div>
              <div class="info-row"><span class="label">Status:</span> <span class="value status-badge status-${order.delivery_status || 'pending'}">${order.delivery_status || 'pending'}</span></div>
            </div>
            <div class="customer-details">
              <div class="section-title">Customer Information</div>
              <div class="info-row"><span class="label">Name:</span> <span class="value">${order.profiles?.full_name || 'N/A'}</span></div>
              <div class="info-row"><span class="label">Phone:</span> <span class="value">${order.profiles?.phone || 'N/A'}</span></div>
              <div class="info-row"><span class="label">Address:</span> <span class="value">${order.addresses?.label || 'N/A'}</span></div>
              <div class="info-row"><span class="label">Location:</span> <span class="value">${order.addresses?.full_address || 'N/A'}</span></div>
              <div class="info-row"><span class="label">City:</span> <span class="value">${order.addresses?.city || 'N/A'}, ${order.addresses?.state || 'N/A'} - ${order.addresses?.pincode || 'N/A'}</span></div>
            </div>
          </div>

          <div class="section-title">Order Items</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map((item: any) => `
                <tr>
                  <td>${item.snapshot_name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.snapshot_price.toFixed(2)}</td>
                  <td>₹${(item.snapshot_price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">Total Amount: ₹${order.final_amount.toFixed(2)}</div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create and download the file
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.id.slice(0, 8)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Receipt downloaded successfully!');
  };

  // Early returns AFTER all hooks (must be after all hooks to follow React Hooks rules)
  if (!vendor?.id) {
    return <p className="text-sm text-muted-foreground">Vendor profile not found.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return <p className="text-sm text-muted-foreground">No orders for your products yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Orders with Your Products</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => testVendorAccess.mutate()}
          disabled={testVendorAccess.isPending}
          className="w-full sm:w-auto"
        >
          Test Access
        </Button>
      </div>
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {(view === 'live' ? liveOrders : historyOrders).filter((o) => !hiddenOrderIds.includes(o.id)).map((o) => {
          const deliveryRequestStatus = (o as any).delivery_requests?.status as string | null;
          const orderStatus = o.delivery_status as string | null;
          const effectiveStatus = deliveryRequestStatus || orderStatus;
          const delivered = deliveryRequestStatus === 'delivered' || orderStatus === 'delivered';
          return (
            <div key={o.id} className={`p-3 sm:p-4 border rounded-md ${delivered ? 'border-green-500 bg-green-50' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <div className="font-semibold text-sm sm:text-base">Order #{o.id.slice(0, 8)}</div>
                  {(o as any).is_order_for_someone_else && (
                    <div className="mt-1"><span className="text-[10px] uppercase bg-secondary text-secondary-foreground px-2 py-0.5 rounded">For Someone Else</span></div>
                  )}
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-xs sm:text-sm">Status: <span className={`uppercase ${delivered ? 'text-green-700' : ''}`}>{STATUS_LABEL[(effectiveStatus || 'pending') as any] || (effectiveStatus || 'pending')}</span></div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">Customer</h4>
                  <p className="text-sm text-muted-foreground">
                    {o.profiles?.full_name || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {o.profiles?.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Delivery Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {o.addresses?.label || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground break-words">
                    {o.addresses?.full_address || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {o.addresses?.city}, {o.addresses?.state} - {o.addresses?.pincode}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-1 mb-3">
                <h4 className="font-medium text-sm mb-1">Order Items</h4>
                {o.order_items.map((oi) => (
                  <div key={oi.id} className="flex justify-between text-sm">
                    <span className="break-words">{oi.snapshot_name} × {oi.quantity}</span>
                    <span className="whitespace-nowrap">₹{(oi.snapshot_price * oi.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Payment Information */}
              <div className="mb-3 p-2 bg-muted/30 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-sm">
                    <span className="font-medium">Payment Method: </span>
                    <span className={o.payment_id === 'COD' ? 'text-blue-600 font-semibold' : 'text-green-600 font-semibold'}>
                      {o.payment_id === 'COD' ? 'COD' : 'Online'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Payment Status: </span>
                    <span className={o.payment_status === 'completed' ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
                      {o.payment_status === 'completed' ? 'Done' : 'Not Done'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="font-bold text-sm sm:text-base">Total: ₹{o.final_amount}</div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadReceipt(o)}
                    className={`w-full sm:w-auto ${delivered ? 'border-green-600 text-green-700' : ''}`}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    <span className="hidden xs:inline">Download Receipt</span>
                    <span className="xs:hidden">Receipt</span>
                  </Button>
                  {view === 'live' && !delivered && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => assignNearest.mutate(o.id)}
                      disabled={
                        assignNearest.isPending ||
                        vendor?.latitude == null ||
                        vendor?.longitude == null ||
                        ['assigned', 'accepted', 'picked_up', 'out_for_delivery', 'delivered'].includes(((o as any).delivery_requests?.status || o.delivery_status) as any)
                      }
                      title={
                        vendor?.latitude == null || vendor?.longitude == null
                          ? 'Set shop location first'
                          : ((o as any).delivery_requests?.status || o.delivery_status) === 'assigned'
                            ? 'Awaiting partner response'
                            : ''
                      }
                      className="w-full sm:w-auto"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {
                        assignNearest.isPending
                          ? 'Assigning…'
                          : ((s => (
                            s === 'assigned'
                              ? 'Awaiting Partner'
                              : s === 'accepted'
                                ? 'Accepted by Partner'
                                : ['picked_up', 'out_for_delivery', 'delivered'].includes(s as any)
                                  ? 'Already Assigned'
                                  : 'Approve & Assign'
                          ))(((o as any).delivery_requests?.status || o.delivery_status) as any))
                      }
                    </Button>
                  )}
                  {view === 'live' && !delivered && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectOrder.mutate(o.id)}
                      disabled={rejectOrder.isPending}
                      className="w-full sm:w-auto"
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  )}
                  {view === 'history' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteOrder.mutate(o.id)}
                      disabled={deleteOrder.isPending}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VendorProductsList = ({ userId }: { userId: string | null }) => {
  const queryClient = useQueryClient();
  const [editProduct, setEditProduct] = useState<null | { id: string; name: string; price: number; stock: number; unit: string | null }>(null);
  const { data: vendor } = useQuery({
    queryKey: ['vendor-profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string } | null;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['vendor-products', vendor?.id],
    enabled: !!vendor?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock, unit, is_approved, image_url, main_image_url')
        .eq('vendor_id', vendor!.id)
        .eq('is_active', true)
        // .eq('is_deleted', false) // Temporarily disabled until migration is applied
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Array<{ id: string; name: string; price: number; stock: number; unit: string | null; is_approved: boolean | null; image_url: string | null }>;
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      // Get product details before deletion to handle file cleanup
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', productId)
        .eq('vendor_id', vendor!.id)
        .single();

      if (fetchError) throw fetchError;

      // Use the new RPC function for soft deletion (temporarily disabled until migration)
      // const { error } = await (supabase as any).rpc('vendor_delete_product', { 
      //   p_product_id: productId 
      // });

      // Temporary: use old deletion method until migration is applied
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId)
        .eq('vendor_id', vendor!.id);

      if (error) throw error;

      // Delete the image file from storage using the utility function
      await deleteProductImage(product.image_url);
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');

      queryClient.invalidateQueries({ queryKey: ['vendor-products', vendor?.id] });

      // Also refresh public product lists and admin lists
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && (
          String(q.queryKey[0]).includes('products') ||
          q.queryKey[0] === 'featured-products' ||
          q.queryKey[0] === 'admin-all-products' ||
          q.queryKey[0] === 'admin-vendor-products' ||
          q.queryKey[0] === 'admin-vendors' ||
          q.queryKey[0] === 'admin-products-count'
        )
      });

      // Specifically invalidate admin-vendor-products queries with any parameters
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'admin-vendor-products'
      });
    },
    onError: () => toast.error('Failed to delete product'),
  });

  if (!vendor?.id) return <p className="text-sm text-muted-foreground">Vendor profile not found.</p>;
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!products || products.length === 0) return <p className="text-sm text-muted-foreground">No products yet.</p>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {products.map((p) => (
          <div key={p.id} className="p-3 sm:p-4 border rounded-md flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="w-16 h-16 bg-muted rounded overflow-hidden flex items-center justify-center flex-shrink-0">
              {p.image_url ? (
                <img src={(p as any).main_image_url || p.image_url} alt={p.name} className="object-cover w-full h-full" />
              ) : (
                <Package className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm sm:text-base">
                <span className="break-words">{p.name}</span>
                {p.is_approved ? (
                  <span className="ml-2 text-xs text-green-600">Approved</span>
                ) : (
                  <span className="ml-2 text-xs text-yellow-600">Pending</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">₹{p.price} • Stock {p.stock}{p.unit ? ` ${p.unit}` : ''}</div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ManageProductPhotosButton productId={p.id} />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditProduct({ id: p.id, name: p.name, price: parseFloat(p.price.toString()) || 0, stock: parseInt(p.stock.toString(), 10) || 0, unit: p.unit || null })}
                title="Edit stock and price"
                className="flex-1 sm:flex-none"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm('Remove this product from the storefront?')) deleteProduct.mutate(p.id);
                }}
                title="Remove product from storefront"
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {editProduct && (
        <EditProductDialog
          vendorId={vendor?.id || ''}
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onUpdated={() => {
            setEditProduct(null);
            queryClient.invalidateQueries({ queryKey: ['vendor-products', vendor?.id] });
            queryClient.invalidateQueries({ queryKey: ['admin-all-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-vendor-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-products-count'] });
          }}
        />
      )}
    </>
  );
};

const ManageProductPhotosButton = ({ productId }: { productId: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} title="Manage photos">
        <Images className="h-4 w-4 mr-1" /> Photos
      </Button>
      {open && <ManageProductPhotosDialog productId={productId} onClose={() => setOpen(false)} />}
    </>
  );
};

const ManageProductPhotosDialog = ({ productId, onClose }: { productId: string; onClose: () => void }) => {
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [angleFiles, setAngleFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [items, setItems] = useState<Array<{ name: string; publicUrl: string }>>([]);

  const fetchList = async () => {
    try {
      const { data, error } = await supabase.storage.from('product-images').list(productId, { sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      const mapped = (data || []).filter((i: any) => i.name !== '.empty').map((i: any) => {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(`${productId}/${i.name}`);
        return { name: i.name, publicUrl: urlData.publicUrl };
      });
      setItems(mapped);
    } catch (e: any) {
      toast.error('Failed to load photos');
    }
  };

  useEffect(() => { fetchList(); }, []);

  const onUpload = async () => {
    if (!mainFile && (!angleFiles || angleFiles.length === 0)) return;
    setIsUploading(true);
    try {
      // Upload main image if provided
      if (mainFile) {
        const ext = mainFile.name.split('.').pop();
        const path = `${productId}/main-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('product-images').upload(path, mainFile, { upsert: false, cacheControl: '3600' });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        await supabase.from('products').update({ main_image_url: urlData.publicUrl }).eq('id', productId);
      }

      // Upload angle images
      if (angleFiles && angleFiles.length > 0) {
        for (const file of Array.from(angleFiles)) {
          const ext = file.name.split('.').pop();
          const path = `${productId}/angle-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false, cacheControl: '3600' });
          if (error) throw error;
        }
      }

      toast.success('Photos uploaded');
      setMainFile(null);
      setAngleFiles(null);
      await fetchList();
    } catch (e: any) {
      toast.error('Failed to upload');
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (name: string) => {
    try {
      const { error } = await supabase.storage.from('product-images').remove([`${productId}/${name}`]);
      if (error) throw error;
      toast.success('Photo deleted');
      await fetchList();
    } catch (e: any) {
      toast.error('Failed to delete photo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background w-full max-w-lg rounded-md p-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-sm sm:text-base">Manage Photos</div>
          <Button size="sm" variant="outline" onClick={onClose} className="text-xs sm:text-sm">Close</Button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium mb-1">Main Image</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setMainFile(e.target.files?.[0] || null)}
                className="w-full text-xs sm:text-sm"
              />
            </div>
            <div>
              <div className="text-xs font-medium mb-1">Angle Images</div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setAngleFiles(e.target.files)}
                className="w-full text-xs sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-2">
            <Button
              size="sm"
              onClick={onUpload}
              disabled={isUploading || (!mainFile && (!angleFiles || angleFiles.length === 0))}
              className="w-full sm:w-auto"
            >
              {isUploading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
          <PhotoGrid items={items} productId={productId} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
};

const PhotoGrid = ({ items, productId, onDelete }: { items: Array<{ name: string; publicUrl: string }>; productId: string; onDelete: (name: string) => Promise<void> }) => {
  const [mainUrl, setMainUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchMain = async () => {
      const { data } = await supabase
        .from('products')
        .select('main_image_url')
        .eq('id', productId)
        .maybeSingle();
      setMainUrl((data as any)?.main_image_url || null);
    };
    fetchMain();
  }, [productId]);

  const setAsMain = async (name: string) => {
    const { data } = supabase.storage.from('product-images').getPublicUrl(`${productId}/${name}`);
    const url = data.publicUrl;
    const { error } = await supabase
      .from('products')
      .update({ main_image_url: url })
      .eq('id', productId);
    if (error) {
      toast.error('Failed to update main image');
      return;
    }
    setMainUrl(url);
    toast.success('Main image updated');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-60 sm:max-h-80 overflow-auto">
      {items.map((it) => (
        <div key={it.name} className="relative border rounded overflow-hidden">
          <img src={it.publicUrl} alt={it.name} className="object-cover w-full h-20 sm:h-28" />
          <div className="absolute top-1 right-1 flex gap-1">
            <Button size="xs" variant="secondary" onClick={() => setAsMain(it.name)} className="h-6 px-2 text-[10px]">
              {mainUrl === it.publicUrl ? 'Main' : 'Set Main'}
            </Button>
            <Button variant="destructive" size="icon" onClick={() => onDelete(it.name)} className="h-6 w-6">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="col-span-2 sm:col-span-3 text-xs sm:text-sm text-muted-foreground text-center py-4">No photos yet. Upload images to showcase the product.</div>
      )}
    </div>
  );
};

const EditProductDialog = ({
  vendorId,
  product,
  onClose,
  onUpdated,
}: {
  vendorId: string;
  product: { id: string; name: string; price: number; stock: number; unit: string | null };
  onClose: () => void;
  onUpdated: () => void;
}) => {
  const [price, setPrice] = useState<string>(product.price.toString());
  const [stock, setStock] = useState<string>(product.stock.toString());
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const newPrice = parseFloat(price) || 0;
    const newStock = parseInt(stock || '0', 10);
    if (!Number.isFinite(newPrice) || newPrice < 0) {
      toast.error('Enter a valid non-negative price');
      return;
    }
    if (!Number.isInteger(newStock) || newStock < 0) {
      toast.error('Enter a valid non-negative stock');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await (supabase as any).rpc('vendor_update_product_stock_price', {
        p_product_id: product.id,
        p_vendor_id: vendorId,
        p_new_stock: newStock,
        p_new_price: newPrice,
      });
      if (error) throw error;
      if (!data?.success) {
        toast.error('Update failed');
      } else {
        onUpdated();
      }
    } catch (e: any) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-md bg-white p-4 shadow-lg">
        <div className="mb-3">
          <div className="text-sm font-semibold">Edit Product</div>
          <div className="text-xs text-muted-foreground truncate">{product.name}</div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Price (₹)</label>
            <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Stock</label>
            <Input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button size="sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
