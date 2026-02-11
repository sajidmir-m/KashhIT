import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ShoppingBag, ShoppingCart, Store, Package, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { ProductReviews } from '@/components/ProductReviews';
import { WishlistButton } from '@/components/WishlistButton';
import { CartButton } from '@/components/CartButton';
import { analytics } from '@/lib/analytics';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  image_url: string | null;
  main_image_url: string | null;
  category_id: string;
  average_rating: number;
  review_count: number;
  brand?: string;
  dietary_preference?: string;
  key_features?: string;
  disclaimer?: string;
  customer_care_details?: string;
  seller_name?: string;
  seller_address?: string;
  seller_license_no?: string;
  country_of_origin?: string;
  shelf_life?: string;
  vendors?: {
    business_name: string;
    business_description: string | null;
  };
  categories?: {
    name: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [gallery, setGallery] = useState<Array<string> | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, vendors(business_name, business_description), categories(name)')
        .eq('id', id)
        .eq('is_approved', true)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as unknown as Product;
    },
  });

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [id]);

  const { addProduct } = useRecentlyViewed();

  // Track product view and add to recently viewed
  useEffect(() => {
    if (product) {
      analytics.productView(product.id, product.name);
      addProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || product.main_image_url,
      });
    }
  }, [product, addProduct]);

  // Load product gallery images
  useEffect(() => {
    if (!product?.id) return;

    let isMounted = true;
    const loadGallery = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('product-images')
          .list(product.id, { sortBy: { column: 'created_at', order: 'asc' } });

        if (error) throw error;

        const images = (data || [])
          .filter((item: any) => item.name !== '.empty')
          .map((item: any) =>
            supabase.storage
              .from('product-images')
              .getPublicUrl(`${product.id}/${item.name}`)
              .data.publicUrl
          );

        if (isMounted) setGallery(images);
      } catch (error) {
        console.error('Error loading gallery:', error);
        if (isMounted) setGallery(null);
      }
    };

    loadGallery();
    return () => { isMounted = false; };
  }, [product?.id]);

  // Set the first image as selected when gallery loads
  useEffect(() => {
    if (!selectedImage) {
      const preferred = product?.main_image_url || product?.image_url;
      if (preferred) {
        setSelectedImage(preferred);
      } else if (gallery && gallery.length > 0) {
        setSelectedImage(gallery[0]);
      }
    }
  }, [gallery, selectedImage, product?.main_image_url, product?.image_url]);

  // Get current cart quantity for Buy Now
  const { data: cartItem } = useQuery({
    queryKey: ['cart-item', id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (cartItem) {
      setBuyNowQuantity(cartItem.quantity || 1);
    }
  }, [cartItem]);

  const { data: relatedProducts, isLoading: isLoadingRelated } = useQuery({
    queryKey: ['related-products', product?.category_id, product?.id],
    queryFn: async () => {
      if (!product?.category_id) return [];
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, unit, stock, main_image_url, image_url')
        .eq('category_id', product.category_id)
        .eq('is_approved', true)
        .eq('is_active', true)
        .neq('id', product.id)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-card flex items-center justify-center">
                {selectedImage || product.image_url ? (
                  <img
                    src={selectedImage || product.main_image_url || product.image_url}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <ShoppingBag className="h-48 w-48 text-muted-foreground/50" />
                )}
              </div>
            </Card>

            {/* Thumbnail images */}
            {gallery && gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-2 bg-muted/30 rounded-lg">
                {gallery.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(src)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-all ${selectedImage === src
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-muted hover:border-primary/50'
                      }`}
                  >
                    <img
                      src={src}
                      alt={`${product.name} angle ${idx + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">{product.categories?.name}</Badge>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= Math.round(product.average_rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground ml-2">
                  ({product.review_count || 0} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">₹{product.price}</span>
              <span className="text-muted-foreground">per {product.unit}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Stock: {product.stock} units available</span>
            </div>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Store className="h-4 w-4 text-primary" />
                <span className="font-semibold">Sold by</span>
              </div>
              <p className="text-lg font-bold">{product.vendors?.business_name}</p>
              {product.vendors?.business_description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {product.vendors.business_description}
                </p>
              )}
            </Card>

            {/* Highlights Section */}
            {(product.brand || product.dietary_preference || product.key_features) && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Highlights</h3>
                <div className="space-y-3">
                  {product.brand && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Brand:</span>
                      <p className="text-base">{product.brand}</p>
                    </div>
                  )}
                  {product.dietary_preference && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Dietary Preference:</span>
                      <p className="text-base">{product.dietary_preference}</p>
                    </div>
                  )}
                  {product.key_features && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Key Features:</span>
                      <p className="text-base whitespace-pre-line">{product.key_features}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Main Information Section */}
            {(product.disclaimer || product.customer_care_details || product.seller_name ||
              product.seller_address || product.seller_license_no || product.country_of_origin || product.shelf_life) && (
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Main Information</h3>
                  <div className="space-y-3">
                    {product.seller_name && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Seller Name:</span>
                        <p className="text-base">{product.seller_name}</p>
                      </div>
                    )}
                    {product.seller_address && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Seller Address:</span>
                        <p className="text-base">{product.seller_address}</p>
                      </div>
                    )}
                    {product.seller_license_no && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Seller License No.:</span>
                        <p className="text-base">{product.seller_license_no}</p>
                      </div>
                    )}
                    {product.country_of_origin && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Country of Origin:</span>
                        <p className="text-base">{product.country_of_origin}</p>
                      </div>
                    )}
                    {product.shelf_life && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Shelf Life:</span>
                        <p className="text-base">{product.shelf_life}</p>
                      </div>
                    )}
                    {product.disclaimer && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Disclaimer:</span>
                        <p className="text-base whitespace-pre-line">{product.disclaimer}</p>
                      </div>
                    )}
                    {product.customer_care_details && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Customer Care Details:</span>
                        <p className="text-base whitespace-pre-line">{product.customer_care_details}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <CartButton
                    productId={product.id}
                    productStock={product.stock}
                    size="lg"
                    className="w-full"
                    showLabel={true}
                  />
                </div>
                <WishlistButton productId={product.id} variant="outline" size="lg" />
              </div>

              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                disabled={product.stock === 0 || (cartItem?.quantity || 0) === 0}
                onClick={async () => {
                  if (!user) {
                    toast.error('Please login to continue');
                    navigate('/auth');
                    return;
                  }

                  // Ensure product is in cart before Buy Now
                  if (!cartItem || cartItem.quantity === 0) {
                    // Add to cart first
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
                    queryClient.invalidateQueries({ queryKey: ['cart-item', product.id, user.id] });

                    // Wait a bit for state to update
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }

                  // Get updated quantity
                  const { data: updatedItem } = await supabase
                    .from('cart_items')
                    .select('quantity')
                    .eq('user_id', user.id)
                    .eq('product_id', product.id)
                    .single();

                  navigate('/checkout', {
                    state: {
                      buyNow: [
                        {
                          product: {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                          },
                          quantity: updatedItem?.quantity || 1,
                        },
                      ],
                    },
                  });
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">You may also like</p>
              <h2 className="text-2xl font-bold">More from this category</h2>
            </div>
          </div>
          {isLoadingRelated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, idx) => (
                <Card key={idx} className="h-64 animate-pulse bg-muted/40" />
              ))}
            </div>
          ) : relatedProducts && relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((related: any) => {
                const image = related.main_image_url || related.image_url;
                return (
                  <Card
                    key={related.id}
                    className="group flex flex-col hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/products/${related.id}`)}
                  >
                    <div className="relative aspect-square bg-gradient-card flex items-center justify-center overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={related.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-4 space-y-3">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold line-clamp-2">{related.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{related.price}{related.unit ? ` / ${related.unit}` : ''}</p>
                      </div>
                      <div className="mt-auto">
                        <div onClick={(e) => e.stopPropagation()}>
                          <CartButton
                            productId={related.id}
                            productStock={related.stock || 0}
                            size="sm"
                            variant="outline"
                            className="w-full"
                            showLabel={true}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No other products found in this category right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
