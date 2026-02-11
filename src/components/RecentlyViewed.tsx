import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, X, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const RecentlyViewed = () => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  // Fetch full product details for recently viewed items
  const productIds = recentlyViewed.map(p => p.id).filter(id => id && id !== 'undefined' && id !== 'null');

  const { data: products } = useQuery({
    queryKey: ['recently-viewed-products', productIds.join(',')],
    queryFn: async () => {
      if (productIds.length === 0) return [];

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, main_image_url, average_rating, review_count, stock, is_active, is_approved')
        .in('id', productIds)
        .eq('is_active', true)
        .eq('is_approved', true);

      if (error) throw error;

      // Maintain order from recentlyViewed
      return productIds
        .map(id => data?.find(p => p.id === id))
        .filter(Boolean) as any[];
    },
    enabled: productIds.length > 0,
  });

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 md:py-10 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
              Recently Viewed
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRecentlyViewed}
            className="text-xs sm:text-sm"
          >
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products?.slice(0, 6).map((product) => {
            if (!product) return null;
            const displayImage = product.main_image_url || product.image_url;

            return (
              <Link key={product.id} to={`/products/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-200 group cursor-pointer">
                  <CardHeader className="p-0 flex-shrink-0 relative h-[120px] sm:h-[160px]">
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={product.name}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    {product.average_rating && product.average_rating > 0 && (
                      <Badge className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px]">
                        ⭐ {product.average_rating.toFixed(1)}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="p-2 sm:p-3 flex-1 flex flex-col">
                    <h4 className="text-xs sm:text-sm font-semibold mb-1 line-clamp-2 text-gray-900 leading-tight">
                      {product.name}
                    </h4>
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm sm:text-base font-bold text-emerald-600">₹{product.price}</span>
                      </div>
                      {product.stock === 0 && (
                        <Badge variant="destructive" className="text-[10px] mt-1">Out of Stock</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

