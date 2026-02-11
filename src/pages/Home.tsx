import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, TrendingUp, Shield, Truck, User, Package, ShoppingCart, Droplets, House, Wrench, ShoppingBasket, Cookie, Candy, Egg, Sparkles, Apple, IceCream, CupSoda, Baby, Leaf, UtensilsCrossed, Percent, Zap, Star, Phone, Mail, MapPin, Plus, Minus, GraduationCap } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { CartButton } from '@/components/CartButton';
import { useCartQuantity } from '@/hooks/useCartQuantity';
import { RecentlyViewed } from '@/components/RecentlyViewed';

const Home = () => {
  const { user, userRoles } = useAuth();
  const navigate = useNavigate();

  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, vendors(business_name), categories(name)')
        .eq('is_approved', true)
        .eq('is_active', true)
        // .eq('is_deleted', false) // Temporarily disabled until migration is applied
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  // Load categories to enable Shop by Category deep-links to filter by category ID
  const { data: homeCategories } = useQuery({
    queryKey: ['categories-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true);
      if (error) throw error;
      return data as Array<{ id: string; name: string }> | null;
    },
  });

  const getCategoryId = (keyword: string): string | null => {
    if (!homeCategories || homeCategories.length === 0) return null;
    const lower = keyword.toLowerCase();
    const match = homeCategories.find((c) => (c.name || '').toLowerCase().includes(lower));
    return match ? match.id : null;
  };

  const getCategoryImage = (name?: string) => {
    const n = (name || '').toLowerCase();
    if (/(atta|rice|dal|lentil|oil|sugar|grain)/.test(n)) return '/atta%20rice.png';
    if (/(biscuit|cookie)/.test(n)) return '/biscuits.png';
    if (/(chip|namkeen|snack)/.test(n)) return '/chips.png';
    if (/(chocolate|candy|sweet)/.test(n)) return '/choclates.png';
    if (/(dairy|bread|egg|milk|bakery)/.test(n)) return '/bread.png';
    if (/(feminine|hygiene|sanitary)/.test(n)) return '/femine%20Hygiene.png';
    if (/(fruit|vegetable|veggie|greens|produce)/.test(n)) return '/fruits%20and%20vegitables.png';
    if (/(home).*?(essential|clean|household)/.test(n)) return '/home%20essentials.png';
    if (/(ice).*?(cream)/.test(n)) return '/ice%20creams.png';
    if (/(iot|hardware|tools?)/.test(n)) return '/iot.png';
    if (/(juice|drink|beverage|soda|soft drink|cola)/.test(n)) return '/juices%20and%20colddrinks.png';
    if (/(kid|baby|infant|toddler)/.test(n)) return '/baby%20care.png';
    if (/(masala|spice|dry.*fruit|nuts?)/.test(n)) return '/masala.png';
    if (/(tea|chai)/.test(n)) return '/tea.png';
    return '/placeholder.svg';
  };

  const { data: topDeals } = useQuery({
    queryKey: ['products-top-deals'],
    queryFn: async () => {
      // Get most selling products based on order_items quantity
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity, orders!inner(delivery_status, payment_status)')
        .in('orders.delivery_status', ['delivered', 'out_for_delivery', 'assigned'])
        .eq('orders.payment_status', 'completed'); // Only count completed orders

      if (orderItemsError) throw orderItemsError;

      // Calculate total quantity sold per product
      const productSales: Record<string, number> = {};
      orderItemsData?.forEach((item: any) => {
        const productId = item.product_id;
        if (!productId || productId === 'undefined' || productId === 'null') return;
        const quantity = item.quantity || 0;
        productSales[productId] = (productSales[productId] || 0) + quantity;
      });

      // Sort products by total quantity sold (descending)
      const sortedProductIds = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .map(([productId]) => productId)
        .slice(0, 12); // Get top 12

      // If no orders exist, fallback to random products
      if (sortedProductIds.length === 0) {
        const { data, error } = await supabase
          .from('products')
          .select('*, vendors(business_name), categories(name)')
          .eq('is_approved', true)
          .eq('is_active', true)
          .limit(12);
        if (error) throw error;
        return data;
      }

      // Fetch product details for top selling products
      const { data: products, error } = await supabase
        .from('products')
        .select('*, vendors(business_name), categories(name)')
        .eq('is_approved', true)
        .eq('is_active', true)
        .in('id', sortedProductIds.filter(Boolean) as string[]);

      if (error) throw error;

      // Sort products according to sales order
      const sortedProducts = sortedProductIds
        .map(id => products?.find(p => p.id === id))
        .filter(Boolean) as any[];

      return sortedProducts;
    },
  });

  const { data: freshArrivals } = useQuery({
    queryKey: ['products-fresh-arrivals'],
    queryFn: async () => {
      // First, get fresh categories (vegetables, fruits, etc.)
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      // Define fresh category keywords
      const freshKeywords = ['vegetable', 'fruit', 'vegetables', 'fruits', 'fresh', 'produce', 'greens', 'organic', 'dairy', 'milk', 'eggs'];

      // Filter categories that match fresh keywords
      const freshCategoryIds = categories
        ?.filter(cat =>
          freshKeywords.some(keyword =>
            cat.name?.toLowerCase().includes(keyword.toLowerCase())
          )
        )
        .map(cat => cat.id) || [];

      // If no fresh categories found, return empty array
      if (freshCategoryIds.length === 0) {
        return [];
      }

      // Fetch products from fresh categories
      const { data, error } = await supabase
        .from('products')
        .select('*, vendors(business_name), categories(name)')
        .eq('is_approved', true)
        .eq('is_active', true)
        .in('category_id', freshCategoryIds)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    },
  });

  const { data: recommended } = useQuery({
    queryKey: ['products-recommended', user?.id],
    queryFn: async () => {
      if (!user) {
        // If not logged in, show popular products
        const { data, error } = await supabase
          .from('products')
          .select('*, vendors(business_name), categories(name)')
          .eq('is_approved', true)
          .eq('is_active', true)
          .limit(12);
        if (error) throw error;
        return data;
      }

      // Get user's order history (purchased products)
      const { data: userOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_items!inner(product_id)')
        .eq('user_id', user.id)
        .in('delivery_status', ['delivered', 'out_for_delivery', 'assigned'])
        .eq('payment_status', 'completed')
        .limit(50); // Get recent orders

      if (ordersError) throw ordersError;

      // Extract product IDs from user's order history
      const purchasedProductIds = new Set<string>();
      userOrders?.forEach((order: any) => {
        order.order_items?.forEach((item: any) => {
          if (item.product_id && item.product_id !== 'undefined' && item.product_id !== 'null') {
            purchasedProductIds.add(item.product_id);
          }
        });
      });

      // Get product categories from purchased products
      const { data: purchasedProducts, error: purchasedError } = await supabase
        .from('products')
        .select('category_id')
        .in('id', Array.from(purchasedProductIds).filter(Boolean) as string[])
        .eq('is_approved', true)
        .eq('is_active', true);

      if (purchasedError) throw purchasedError;

      // Get unique category IDs from purchased products
      const userCategoryIds = new Set<string>();
      purchasedProducts?.forEach((p: any) => {
        if (p.category_id) {
          userCategoryIds.add(p.category_id);
        }
      });

      // If user has purchase history, recommend products from same categories
      if (userCategoryIds.size > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('*, vendors(business_name), categories(name)')
          .eq('is_approved', true)
          .eq('is_active', true)
          .in('category_id', Array.from(userCategoryIds))
          .not('id', 'in', `(${Array.from(purchasedProductIds).join(',')})`) // Exclude already purchased
          .limit(12);

        if (error) throw error;

        // If we have recommendations, return them
        if (data && data.length > 0) {
          return data;
        }
      }

      // Fallback: Show popular products (most sold)
      // Get most selling products as recommendation
      const { data: popularOrderItems, error: popularError } = await supabase
        .from('order_items')
        .select('product_id, quantity, orders!inner(delivery_status, payment_status)')
        .in('orders.delivery_status', ['delivered', 'out_for_delivery', 'assigned'])
        .eq('orders.payment_status', 'completed');

      if (popularError) throw popularError;

      // Calculate product popularity
      const productPopularity: Record<string, number> = {};
      popularOrderItems?.forEach((item: any) => {
        if (item.product_id && item.product_id !== 'undefined' && item.product_id !== 'null') {
          productPopularity[item.product_id] = (productPopularity[item.product_id] || 0) + (item.quantity || 0);
        }
      });

      // Sort by popularity and get top product IDs
      const popularProductIds = Object.entries(productPopularity)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 12)
        .map(([id]) => id);

      if (popularProductIds.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('*, vendors(business_name), categories(name)')
          .eq('is_approved', true)
          .eq('is_active', true)
          .in('id', popularProductIds.filter(Boolean) as string[])

        if (error) throw error;
        return data;
      }

      // Final fallback: Random approved products
      const { data, error } = await supabase
        .from('products')
        .select('*, vendors(business_name), categories(name)')
        .eq('is_approved', true)
        .eq('is_active', true)
        .limit(12);

      if (error) throw error;
      return data;
    },
  });

  const isLoggedIn = !!user;
  const isAdmin = userRoles.includes('admin');
  const isVendor = userRoles.includes('vendor');
  const isDelivery = userRoles.includes('delivery');
  const queryClient = useQueryClient();

  // Note: CartButton component handles add to cart now

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative text-white py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 px-2 xs:px-3 sm:px-4 overflow-hidden mx-2 xs:mx-3 sm:mx-4 md:mx-6 lg:mx-8 mt-2 xs:mt-3 sm:mt-4 rounded-3xl">
        {/* Background Image */}
        <div
          className="absolute inset-0 rounded-3xl bg-cover bg-top bg-no-repeat"
          style={{
            backgroundImage: 'url(/cart.jpg)',
          }}
        />
        {/* Silver and Sky Blue Gradient Overlays for polished effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-slate-400/30 via-sky-300/20 to-slate-500/40" />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-sky-200/25 via-transparent to-slate-300/30" />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/20 via-transparent to-slate-400/15" />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 rounded-3xl bg-black/10" />
        <div className="container relative mx-auto px-2 xs:px-3 sm:px-4">
          <div className="flex items-center justify-center">
            <div className="text-center max-w-3xl">
              {isLoggedIn ? (
                <>
                  <h1 className="text-2xl xs:text-[28px] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-3 xs:mb-4 sm:mb-5 md:mb-6 drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)] px-2">
                    <span className="text-gray-900">
                      Welcome back!
                    </span>
                  </h1>
                  <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 xs:mb-5 sm:mb-6 md:mb-8 text-gray-900 font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.2)] max-w-2xl mx-auto px-2 xs:px-3">
                    {isAdmin && "Manage your platform and oversee operations."}
                    {isVendor && "Manage your products and track your orders."}
                    {isDelivery && "View your delivery assignments and update status."}
                    {!isAdmin && !isVendor && !isDelivery && "Continue shopping and manage your orders."}
                  </p>
                  <div className="flex flex-col xs:flex-row gap-2 xs:gap-2 sm:gap-3 md:gap-4 justify-center items-center px-2 xs:px-3">
                    <Link to="/products" className="w-full xs:w-auto">
                      <Button size="lg" variant="outline" className="w-full xs:w-auto text-xs xs:text-sm sm:text-base h-9 xs:h-10 sm:h-11 md:h-12 bg-white/90 border-white/50 text-gray-900 hover:bg-white hover:border-white hover:text-gray-950 backdrop-blur-sm px-4 xs:px-5 sm:px-6">
                        <ShoppingBag className="mr-1.5 xs:mr-2 h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                        Browse Products
                      </Button>
                    </Link>
                    <Link to="/orders" className="w-full xs:w-auto">
                      <Button size="lg" variant="outline" className="bg-white/90 border-white/50 text-gray-900 hover:bg-white hover:border-white hover:text-gray-950 backdrop-blur-sm w-full xs:w-auto text-xs xs:text-sm sm:text-base h-9 xs:h-10 sm:h-11 md:h-12 px-4 xs:px-5 sm:px-6">
                        <Package className="mr-1.5 xs:mr-2 h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                        My Orders
                      </Button>
                    </Link>
                    {(isAdmin || isVendor || isDelivery) && (
                      <Link to={isAdmin ? "/admin" : isVendor ? "/vendor" : "/delivery"} className="w-full xs:w-auto">
                        <Button size="lg" variant="outline" className="bg-white/90 border-white/50 text-gray-900 hover:bg-white hover:border-white hover:text-gray-950 backdrop-blur-sm w-full xs:w-auto text-xs xs:text-sm sm:text-base h-9 xs:h-10 sm:h-11 md:h-12 px-4 xs:px-5 sm:px-6">
                          <User className="mr-1.5 xs:mr-2 h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl xs:text-[28px] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-2 xs:mb-3 sm:mb-4 drop-shadow-[0_2px_4px_rgba(255,255,255,0.5)] px-2">
                    <span className="text-black font-black">
                      Live Better best
                    </span>
                  </h1>
                  <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl mb-4 xs:mb-5 sm:mb-6 md:mb-8 text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.7),0_1px_2px_rgba(0,0,0,0.5)] max-w-2xl mx-auto px-2 xs:px-3">
                    Discover quality products from trusted vendors. Fast delivery, secure payments, and unbeatable prices.
                  </p>
                  <div className="flex flex-col xs:flex-row gap-2 xs:gap-2 sm:gap-3 md:gap-4 justify-center items-center px-2 xs:px-3">
                    <Link to="/products" className="w-full xs:w-auto">
                      <Button size="lg" variant="outline" className="w-full xs:w-auto text-xs xs:text-sm sm:text-base h-9 xs:h-10 sm:h-11 md:h-12 bg-white/90 border-white/50 text-gray-900 hover:bg-white hover:border-white hover:text-gray-950 backdrop-blur-sm px-4 xs:px-5 sm:px-6">
                        <ShoppingBag className="mr-1.5 xs:mr-2 h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                        Browse Products
                      </Button>
                    </Link>
                    <Link to="/auth" className="w-full xs:w-auto">
                      <Button size="lg" className="w-full xs:w-auto text-xs xs:text-sm sm:text-base h-9 xs:h-10 sm:h-11 md:h-12 bg-white/90 text-gray-900 hover:bg-white hover:text-gray-950 backdrop-blur-sm border border-white/50 px-4 xs:px-5 sm:px-6">
                        <User className="mr-1.5 xs:mr-2 h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Offers Carousel */}
      <section className="px-2 sm:px-4 pt-2">
        <div className="container mx-auto">
          <AutoCarousel>
            <CarouselContent>
              <CarouselItem>
                <div className="h-32 xs:h-36 sm:h-40 md:h-48 lg:h-56 w-full flex flex-col sm:flex-row items-center justify-between px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 gap-2 xs:gap-3 sm:gap-4 overflow-hidden relative">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: 'url(/essentails.jpg)',
                    }}
                  />
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/20" />
                  <div className="flex-1 text-center sm:text-left min-w-0 z-10 relative">
                    <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Big Savings on Essentials</h3>
                    <p className="text-white/95 mt-0.5 xs:mt-1 text-[10px] xs:text-xs sm:text-sm md:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">Fast delivery to your doorstep.</p>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="h-32 xs:h-36 sm:h-40 md:h-48 lg:h-56 w-full flex flex-col sm:flex-row items-center justify-between px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 gap-2 xs:gap-3 sm:gap-4 overflow-hidden relative">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: 'url(/fresh%20arrivals.png)',
                    }}
                  />
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/20" />
                  <div className="flex-1 text-center sm:text-left min-w-0 z-10 relative">
                    <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Fresh Arrivals</h3>
                    <p className="text-white/95 mt-0.5 xs:mt-1 text-[10px] xs:text-xs sm:text-sm md:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">Discover new items curated for you.</p>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="h-32 xs:h-36 sm:h-40 md:h-48 lg:h-56 w-full flex flex-col sm:flex-row items-center justify-between px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 gap-2 xs:gap-3 sm:gap-4 overflow-hidden relative">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: 'url(/Recommand.jpg)',
                    }}
                  />
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/20" />
                  <div className="flex-1 text-center sm:text-left min-w-0 z-10 relative">
                    <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Recommended For You</h3>
                    <p className="text-white/95 mt-0.5 xs:mt-1 text-[10px] xs:text-xs sm:text-sm md:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">Handpicked top picks by customers.</p>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
          </AutoCarousel>
        </div>
      </section>

      {/* Shop by Category - UI only, links to products with query params */}
      <section className="py-6 sm:py-8 md:py-12 px-0 bg-white">
        <div className="w-full">
          <div className="mb-4 sm:mb-6 text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-900">Shop by Category</h2>
            <p className="text-sm sm:text-base text-emerald-700 mt-1">Quickly find what you need</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 p-3 sm:p-4 md:p-6 lg:p-8 bg-emerald-50/50 mx-2 xs:mx-3 sm:mx-4 md:mx-6 lg:mx-8">
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 justify-items-center items-start">
              {(homeCategories || [])
                .slice() // shallow copy for sort
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                .map((cat) => (
                  <Link key={cat.id} to={`/products?category=${cat.id}`} className="group cursor-pointer w-full">
                    <div className="text-center">
                      <div className="w-[80px] h-[80px] bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center mb-1 sm:mb-2 mx-auto group-hover:scale-110 transition-transform shadow-sm overflow-hidden">
                        <img
                          src={getCategoryImage(cat.name)}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-gray-700 text-[10px] xs:text-xs sm:text-xs font-medium line-clamp-2 px-1">{cat.name}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions for Logged-in Users */}
      {isLoggedIn && (
        <section className="py-6 sm:py-8 md:py-12 px-4 bg-background">
          <div className="container mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Quick Actions</h2>
            <div className="flex flex-wrap justify-center items-stretch gap-3 sm:gap-4 md:gap-5 lg:gap-6 max-w-6xl mx-auto">
              <Link to="/products" className="group flex-shrink-0">
                <Card className="text-center border-none shadow-md hover:shadow-lg transition-shadow group-hover:scale-105 h-full w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary mx-auto mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Browse Products</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Discover new items</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/orders" className="group flex-shrink-0">
                <Card className="text-center border-none shadow-md hover:shadow-lg transition-shadow group-hover:scale-105 h-full w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary mx-auto mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-1 sm:mb-2">My Orders</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Track your orders</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/cart" className="group flex-shrink-0">
                <Card className="text-center border-none shadow-md hover:shadow-lg transition-shadow group-hover:scale-105 h-full w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary mx-auto mb-2 sm:mb-3" />
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Shopping Cart</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Review your items</p>
                  </CardContent>
                </Card>
              </Link>

              {(isAdmin || isVendor || isDelivery) && (
                <Link to={isAdmin ? "/admin" : isVendor ? "/vendor" : "/delivery"} className="group flex-shrink-0">
                  <Card className="text-center border-none shadow-md hover:shadow-lg transition-shadow group-hover:scale-105 h-full w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary mx-auto mb-2 sm:mb-3" />
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Dashboard</h3>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        {isAdmin && "Admin Panel"}
                        {isVendor && "Vendor Panel"}
                        {isDelivery && "Delivery Panel"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-900 mb-3 sm:mb-4">
              {isLoggedIn ? "Featured Products" : "Discover Our Products"}
            </h2>
            <p className="text-emerald-800 text-base sm:text-lg">
              {isLoggedIn
                ? "Handpicked selections from our top vendors"
                : "Quality products from trusted vendors at unbeatable prices"
              }
            </p>
          </div>

          <div className="relative">
            {/* Mobile: Horizontal scroll with 2 products */}
            <div className="flex sm:hidden gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory">
              {featuredProducts?.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[calc((100%-0.75rem)/2)] snap-start">
                  <ProductCard
                    product={product}
                    onAdd={() => { }} // Handled by CartButton
                    onBuyNow={async (product) => {
                      if (!user) {
                        toast.error('Please login to continue');
                        navigate('/auth');
                        return;
                      }

                      // Ensure product is in cart
                      const { data: cartItem } = await supabase
                        .from('cart_items')
                        .select('quantity')
                        .eq('user_id', user.id)
                        .eq('product_id', product.id)
                        .maybeSingle();

                      if (!cartItem || cartItem.quantity === 0) {
                        const { data: existing } = await supabase
                          .from('cart_items')
                          .select('*')
                          .eq('user_id', user.id)
                          .eq('product_id', product.id)
                          .maybeSingle();

                        if (existing) {
                          await supabase
                            .from('cart_items')
                            .update({ quantity: 1 })
                            .eq('id', existing.id);
                        } else {
                          await supabase
                            .from('cart_items')
                            .insert({
                              user_id: user.id,
                              product_id: product.id,
                              quantity: 1,
                            });
                        }
                        queryClient.invalidateQueries({ queryKey: ['cart'] });
                        queryClient.invalidateQueries({ queryKey: ['cart-item'] });
                      }

                      const { data: updatedItem } = await supabase
                        .from('cart_items')
                        .select('quantity')
                        .eq('user_id', user.id)
                        .eq('product_id', product.id)
                        .single();

                      navigate('/checkout', {
                        state: {
                          buyNow: [{
                            product: {
                              id: product.id,
                              name: product.name,
                              price: product.price,
                            },
                            quantity: updatedItem?.quantity || 1,
                          }],
                        },
                      });
                    }}
                    user={user}
                    navigate={navigate}
                  />
                </div>
              ))}
            </div>
            {/* Tablet: Grid with 3 products per row */}
            <div className="hidden sm:grid sm:grid-cols-3 md:hidden gap-4 justify-items-stretch">
              {featuredProducts?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => { }} // Handled by CartButton
                  onBuyNow={(product) => {
                    if (!user) {
                      toast.error('Please login to continue');
                      navigate('/auth');
                      return;
                    }
                    navigate('/checkout', {
                      state: {
                        buyNow: [{
                          product: {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                          },
                          quantity: 1,
                        }],
                      },
                    });
                  }}
                  user={user}
                  navigate={navigate}
                />
              ))}
            </div>
            {/* Desktop: Grid with 4-6 products per row */}
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5 justify-items-stretch">
              {featuredProducts?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => { }} // Handled by CartButton
                  onBuyNow={(product) => {
                    if (!user) {
                      toast.error('Please login to continue');
                      navigate('/auth');
                      return;
                    }
                    navigate('/checkout', {
                      state: {
                        buyNow: [{
                          product: {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                          },
                          quantity: 1,
                        }],
                      },
                    });
                  }}
                  user={user}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <Link to="/products">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-emerald-300 text-emerald-900 hover:bg-emerald-50">
                See All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Product Rails */}
      <HomeRail
        title="Top Deals"
        items={topDeals}
        onAdd={() => { }} // Handled by CartButton
        onBuyNow={async (product) => {
          if (!user) {
            toast.error('Please login to continue');
            navigate('/auth');
            return;
          }

          // Ensure product is in cart
          const { data: cartItem } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .maybeSingle();

          if (!cartItem || cartItem.quantity === 0) {
            const { data: existing } = await supabase
              .from('cart_items')
              .select('*')
              .eq('user_id', user.id)
              .eq('product_id', product.id)
              .maybeSingle();

            if (existing) {
              await supabase
                .from('cart_items')
                .update({ quantity: 1 })
                .eq('id', existing.id);
            } else {
              await supabase
                .from('cart_items')
                .insert({
                  user_id: user.id,
                  product_id: product.id,
                  quantity: 1,
                });
            }
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['cart-item'] });
          }

          const { data: updatedItem } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .single();

          navigate('/checkout', {
            state: {
              buyNow: [{
                product: {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                },
                quantity: updatedItem?.quantity || 1,
              }],
            },
          });
        }}
        navigate={navigate}
      />
      <HomeRail
        title="Fresh Arrivals"
        items={freshArrivals}
        onAdd={() => { }} // Handled by CartButton
        onBuyNow={async (product) => {
          if (!user) {
            toast.error('Please login to continue');
            navigate('/auth');
            return;
          }

          // Ensure product is in cart
          const { data: cartItem } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .maybeSingle();

          if (!cartItem || cartItem.quantity === 0) {
            const { data: existing } = await supabase
              .from('cart_items')
              .select('*')
              .eq('user_id', user.id)
              .eq('product_id', product.id)
              .maybeSingle();

            if (existing) {
              await supabase
                .from('cart_items')
                .update({ quantity: 1 })
                .eq('id', existing.id);
            } else {
              await supabase
                .from('cart_items')
                .insert({
                  user_id: user.id,
                  product_id: product.id,
                  quantity: 1,
                });
            }
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['cart-item'] });
          }

          const { data: updatedItem } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .single();

          navigate('/checkout', {
            state: {
              buyNow: [{
                product: {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                },
                quantity: updatedItem?.quantity || 1,
              }],
            },
          });
        }}
        navigate={navigate}
      />
      <HomeRail
        title="Recommended for You"
        items={recommended}
        onAdd={() => { }} // Handled by CartButton
        onBuyNow={async (product) => {
          if (!user) {
            toast.error('Please login to continue');
            navigate('/auth');
            return;
          }

          // Ensure product is in cart
          const { data: cartItem } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .maybeSingle();

          if (!cartItem || cartItem.quantity === 0) {
            const { data: existing } = await supabase
              .from('cart_items')
              .select('*')
              .eq('user_id', user.id)
              .eq('product_id', product.id)
              .maybeSingle();

            if (existing) {
              await supabase
                .from('cart_items')
                .update({ quantity: 1 })
                .eq('id', existing.id);
            } else {
              await supabase
                .from('cart_items')
                .insert({
                  user_id: user.id,
                  product_id: product.id,
                  quantity: 1,
                });
            }
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['cart-item'] });
          }

          const { data: updatedItem } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .single();

          navigate('/checkout', {
            state: {
              buyNow: [{
                product: {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                },
                quantity: updatedItem?.quantity || 1,
              }],
            },
          });
        }}
        navigate={navigate}
      />

      {/* Recently Viewed Products */}
      <RecentlyViewed />

      {/* Services for Software + Hardware Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wrench className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Services for Software + Hardware</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  Explore our comprehensive internship programs in software and hardware development. 
                  Gain hands-on experience, work on real projects, and learn from industry experts.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                  <Badge variant="secondary" className="text-xs">Frontend Development</Badge>
                  <Badge variant="secondary" className="text-xs">Backend Development</Badge>
                  <Badge variant="secondary" className="text-xs">Full Stack</Badge>
                  <Badge variant="secondary" className="text-xs">Mobile Apps</Badge>
                  <Badge variant="secondary" className="text-xs">DevOps & Cloud</Badge>
                  <Badge variant="secondary" className="text-xs">Data Science & AI</Badge>
                  <Badge variant="secondary" className="text-xs">Cybersecurity</Badge>
                </div>
                <Link to="/internships" className="inline-block">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Explore Internships
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action for Non-logged-in Users */}
      {!isLoggedIn && (
        <section className="py-12 sm:py-16 md:py-20 px-4 text-white relative overflow-hidden rounded-3xl mx-2 xs:mx-3 sm:mx-4 md:mx-6 lg:mx-8 my-4 sm:my-6 md:my-8">
          <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(135deg, #fcfcfc 0%, #eaeaea 22%, #ffffff 48%, #e6e6e6 68%, #d5eaff 85%, #cbe4ff 100%)' }} />
          <div className="absolute -top-12 xs:-top-16 sm:-top-20 md:-top-24 -right-12 xs:-right-16 sm:-right-20 md:-right-24 w-32 xs:w-48 sm:w-56 md:w-64 h-32 xs:h-48 sm:h-56 md:h-64 rounded-full blur-2xl sm:blur-3xl" style={{ background: 'rgba(213, 234, 255, 0.3)' }} />
          <div className="absolute -bottom-12 xs:-bottom-16 sm:-bottom-20 md:-bottom-24 -left-12 xs:-left-16 sm:-left-20 md:-left-24 w-32 xs:w-48 sm:w-56 md:w-64 h-32 xs:h-48 sm:h-56 md:h-64 rounded-full blur-xl sm:blur-2xl" style={{ background: 'rgba(234, 234, 234, 0.2)' }} />
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
              Ready to Start Shopping?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-900 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover amazing products at great prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white/40 text-gray-900 hover:bg-white/60 hover:text-gray-950 backdrop-blur-sm border border-white/30">
                  <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Create Account
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="bg-white/30 border-white/40 text-gray-900 hover:bg-white/50 hover:border-white/70 hover:text-gray-950 backdrop-blur-sm w-full sm:w-auto">
                  <ShoppingBag className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-8 sm:mt-12 md:mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Company Info */}
            <div className="xs:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <img src="/logo.png" alt="KasshIT" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 object-contain" />
                <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  KasshIT
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 leading-relaxed">
                Your trusted online marketplace for quality products. Fast delivery, secure payments, and unbeatable prices.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                    Shopping Cart
                  </Link>
                </li>
                {!user && (
                  <li>
                    <Link to="/auth" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                      Sign In
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Customer Service</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <Link to="/profile" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                    My Profile
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                    Returns
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Contact Us</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center space-x-2">
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 flex-shrink-0" />
                  <a href="tel:+911234567890" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors break-all">
                    +91 123 456 7890
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 flex-shrink-0" />
                  <a href="mailto:support@kasshit.com" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors break-all">
                    support@kasshit.com
                  </a>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <span className="text-gray-400 text-xs sm:text-sm">
                    India
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-6 sm:pt-8 mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
                © {new Date().getFullYear()} KasshIT. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                <Link to="/privacy-policy" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookie-policy" className="text-gray-400 hover:text-emerald-400 text-xs sm:text-sm transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

const AutoCarousel = ({ children }: { children: React.ReactNode }) => {
  const [api, setApi] = useState<any>(null);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <Carousel
      className="rounded-xl overflow-hidden shadow-md"
      setApi={setApi}
      opts={{
        align: "start",
        loop: true,
      }}
    >
      {children}
    </Carousel>
  );
};

const AnimatedInView = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setVisible(true); });
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      {children}
    </div>
  );
};

const MiniProductCard = ({ product, onAdd, onBuyNow, navigate }: { product: any; onAdd: () => void; onBuyNow: () => void; navigate: any }) => {
  const displayImage = (product as any).main_image_url || product.image_url;
  const cartQuantity = useCartQuantity(product.id);
  const unitPrice = parseFloat(product.price) || 0;
  const totalPrice = (unitPrice * cartQuantity).toFixed(2);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { user } = useAuth();
    if (!user) {
      toast.error('Please login to continue');
      navigate('/auth');
      return;
    }

    // Ensure product is in cart
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle();

    if (!cartItem || cartItem.quantity === 0) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          });
      }
    }

    onBuyNow();
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 w-full h-full flex flex-col group border border-gray-200 relative bg-white rounded-lg">
      {/* Image Section - Fixed Height */}
      <CardHeader className="p-0 cursor-pointer flex-shrink-0 relative h-[160px] sm:h-[200px] md:h-[240px]" onClick={handleViewDetails}>
        {product.categories?.name && (
          <div className="absolute top-1.5 left-1.5 z-10">
            <Badge variant="secondary" className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-emerald-500/90 text-white border-0 backdrop-blur-sm shadow-sm">
              {product.categories.name}
            </Badge>
          </div>
        )}
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
      </CardHeader>

      {/* Product Info Section - Flexible */}
      <CardContent className="p-2 sm:p-2.5 flex-1 flex flex-col min-h-0">
        {/* Product Name */}
        <CardTitle
          className="text-xs sm:text-sm font-semibold mb-1.5 line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors text-gray-900 leading-tight"
          onClick={handleViewDetails}
        >
          {product.name}
        </CardTitle>

        {/* Price Section */}
        <div className="mb-2 space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-emerald-600">₹{product.price}</span>
            {product.unit && (
              <span className="text-[9px] sm:text-[10px] text-gray-500">/{product.unit}</span>
            )}
          </div>
          {cartQuantity > 0 && (
            <div className="flex items-center justify-between p-1.5 bg-emerald-50 rounded-md">
              <span className="text-[10px] sm:text-xs text-gray-700 font-medium">Total:</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-700">
                ₹{totalPrice}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Action Buttons - Fixed at Bottom */}
      <CardFooter className="p-2 pt-1.5 flex-shrink-0 flex flex-col gap-1.5 border-t border-gray-100 bg-gray-50/50">
        {/* Action Buttons Row */}
        <div className="flex gap-1.5 w-full min-w-0">
          <div className="flex-1" onClick={(e) => e.stopPropagation()}>
            <CartButton
              productId={product.id}
              productStock={product.stock || 0}
              variant="outline"
              size="sm"
              className="w-full h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm"
              showLabel={true}
            />
          </div>
          <Button
            variant="default"
            className="flex-1 h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-white min-w-0 px-1.5 sm:px-2.5 whitespace-nowrap"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const HomeRail = ({ title, items, onAdd, onBuyNow, navigate }: { title: string; items: any[] | undefined; onAdd: (id: string) => void; onBuyNow: (product: any) => void; navigate: any }) => {
  if (!items || items.length === 0) return null;
  return (
    <section className="py-6 sm:py-8 md:py-10 px-4 bg-white">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">{title}</h3>
          <Link to="/products" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="relative">
          {/* Mobile: Horizontal scroll with 2 products */}
          <div className="flex sm:hidden gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory">
            {items.map((p: any) => (
              <div key={p.id} className="flex-shrink-0 w-[calc((100%-0.75rem)/2)] snap-start">
                <MiniProductCard
                  product={p}
                  onAdd={() => onAdd(p.id)}
                  onBuyNow={() => onBuyNow(p)}
                  navigate={navigate}
                />
              </div>
            ))}
          </div>
          {/* Tablet: Grid with 3 products per row */}
          <div className="hidden sm:grid sm:grid-cols-3 md:hidden gap-4 justify-items-stretch">
            {items.map((p: any) => (
              <MiniProductCard
                key={p.id}
                product={p}
                onAdd={() => onAdd(p.id)}
                onBuyNow={() => onBuyNow(p)}
                navigate={navigate}
              />
            ))}
          </div>
          {/* Desktop: Grid with 4-6 products per row */}
          <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5 justify-items-stretch">
            {items.map((p: any) => (
              <MiniProductCard
                key={p.id}
                product={p}
                onAdd={() => onAdd(p.id)}
                onBuyNow={() => onBuyNow(p)}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({ product, onAdd, onBuyNow, user, navigate }: { product: any; onAdd: () => void; onBuyNow?: (product: any) => void; user: any; navigate: any }) => {
  const [gallery, setGallery] = useState<Array<string> | null>(null);
  const cartQuantity = useCartQuantity(product.id);
  const unitPrice = parseFloat(product.price) || 0;
  const totalPrice = (unitPrice * cartQuantity).toFixed(2);
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('product-images')
          .list(product.id, { sortBy: { column: 'created_at', order: 'asc' } });

        if (error) {
          return;
        }

        const images = (data || [])
          .filter((i: any) => i.name !== '.empty')
          .map((i: any) =>
            supabase.storage
              .from('product-images')
              .getPublicUrl(`${product.id}/${i.name}`)
              .data.publicUrl
          );

        if (isMounted) setGallery(images);
      } catch (error) {
        if (isMounted) setGallery(null);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [product?.id]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const hasGallery = gallery && gallery.length > 0;

  useEffect(() => {
    if (hasGallery && !selectedImage) {
      setSelectedImage(gallery[0]);
    }
  }, [hasGallery, selectedImage, gallery]);

  const displayImage = selectedImage || (product as any).main_image_url || product.image_url;

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onBuyNow || !user) {
      if (!user) {
        toast.error('Please login to continue');
        navigate('/auth');
      }
      return;
    }

    // Ensure product is in cart
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle();

    if (!cartItem || cartItem.quantity === 0) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          });
      }
    }

    onBuyNow(product);
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 w-full h-full flex flex-col border border-gray-200 group relative bg-white rounded-lg">
      {/* Image Section - Fixed Height */}
      <CardHeader className="p-0 cursor-pointer flex-shrink-0 relative h-[160px] sm:h-[200px] md:h-[240px]" onClick={handleViewDetails}>
        {product.categories?.name && (
          <div className="absolute top-1.5 left-1.5 z-10">
            <Badge variant="secondary" className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-emerald-500/90 text-white border-0 backdrop-blur-sm shadow-sm">
              {product.categories.name}
            </Badge>
          </div>
        )}
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
      </CardHeader>

      {/* Product Info Section - Flexible */}
      <CardContent className="p-2 sm:p-2.5 flex-1 flex flex-col min-h-0">
        {/* Product Name */}
        <CardTitle
          className="text-xs sm:text-sm font-semibold mb-1.5 line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors text-gray-900 leading-tight"
          onClick={handleViewDetails}
        >
          {product.name}
        </CardTitle>

        {/* Price Section */}
        <div className="mb-2 space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-emerald-600">₹{product.price}</span>
            {product.unit && (
              <span className="text-[9px] sm:text-[10px] text-gray-500">/{product.unit}</span>
            )}
          </div>
          {cartQuantity > 0 && (
            <div className="flex items-center justify-between p-1.5 bg-emerald-50 rounded-md">
              <span className="text-[10px] sm:text-xs text-gray-700 font-medium">Total:</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-700">
                ₹{totalPrice}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Action Buttons - Fixed at Bottom */}
      <CardFooter className="p-2 pt-1.5 flex-shrink-0 flex flex-col gap-1.5 border-t border-gray-100 bg-gray-50/50">
        {/* Action Buttons Row */}
        <div className="flex gap-1.5 w-full min-w-0">
          <div className="flex-1" onClick={(e) => e.stopPropagation()}>
            <CartButton
              productId={product.id}
              productStock={product.stock || 0}
              variant="outline"
              size="sm"
              className="w-full h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm"
              showLabel={true}
            />
          </div>
          <Button
            variant="default"
            className="flex-1 h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-white min-w-0 px-1.5 sm:px-2.5 whitespace-nowrap"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
