import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { CartButton } from '@/components/CartButton';
import { useCartQuantity } from '@/hooks/useCartQuantity';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating' | 'popularity'>('newest');

  // Initialize category filter and search from URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category');
    const searchFromUrl = params.get('search');
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    } else {
      setCategoryFilter('all');
    }
    if (searchFromUrl) {
      setSearch(searchFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', categoryFilter, search, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, vendors(business_name), categories(name)')
        .eq('is_approved', true)
        .eq('is_active', true)
        // .eq('is_deleted', false); // Temporarily disabled until migration is applied

      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('average_rating', { ascending: false, nullsFirst: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popularity':
          // Sort by review_count or created_at as fallback
          query = query.order('review_count', { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // For popularity, we might want to sort by a combination of factors
      // For now, we'll use review_count as a proxy
      return data;
    },
  });

  // Note: CartButton component handles add to cart now

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Products</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              const params = new URLSearchParams(location.search);
              if (value === 'all') {
                params.delete('category');
              } else {
                params.set('category', value);
              }
              navigate({ pathname: '/products', search: params.toString() });
            }}
          >
            <SelectTrigger className="w-full sm:w-48 md:w-64">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as any)}
          >
            <SelectTrigger className="w-full sm:w-48 md:w-64">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-stretch">
                {[...Array(12)].map((_, i) => (
                  <Card key={i} className="animate-pulse h-full">
                    <div className="h-[160px] sm:h-[200px] md:h-[240px] bg-muted" />
                    <CardContent className="p-2 sm:p-2.5 space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-stretch">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    navigate={navigate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <p className="text-lg sm:text-xl text-muted-foreground">No products found</p>
              </div>
            )}
      </div>
    </div>
  );
};

const ProductCard = ({ product, navigate }: { product: any; navigate: any }) => {
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

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 w-full h-full flex flex-col border border-gray-200 group relative bg-white rounded-lg">
      {/* Image Section - Fixed Height */}
      <CardHeader className="p-0 cursor-pointer flex-shrink-0 relative h-[100px] sm:h-[120px] md:h-[140px]" onClick={handleViewDetails}>
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
        </div>
      </CardFooter>
    </Card>
  );
};

export default Products;
