import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Package, ShoppingBag, ArrowLeft } from 'lucide-react';

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Read search query from URL params (synced with Navbar)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get('q') || '';
    setDebouncedSearch(urlQuery);
  }, [location.search]);

  // Fetch search suggestions
  const { data: searchSuggestions, isLoading: isSearching } = useQuery({
    queryKey: ['search-suggestions-page', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.trim().length < 1) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, main_image_url, categories(name), description')
        .eq('is_approved', true)
        .eq('is_active', true)
        .ilike('name', `%${debouncedSearch.trim()}%`)
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: debouncedSearch.trim().length >= 1,
  });

  const handleSearch = () => {
    if (debouncedSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(debouncedSearch.trim())}`);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 sm:mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm sm:text-base">Back</span>
          </Button>

          {/* Search Suggestions/Results */}
          {debouncedSearch.trim().length >= 1 && (
            <div>
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
                  <span className="text-lg text-gray-600">Searching products...</span>
                </div>
              ) : searchSuggestions && searchSuggestions.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Found {searchSuggestions.length} {searchSuggestions.length === 1 ? 'product' : 'products'}
                    </h2>
                    <Button
                      variant="outline"
                      onClick={handleSearch}
                      className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                    >
                      View All Results
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                    {searchSuggestions.map((product: any) => (
                      <Card
                        key={product.id}
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 w-full h-full flex flex-col border border-gray-200 group relative bg-white rounded-lg"
                        onClick={() => handleSuggestionClick(product.id)}
                      >
                        <CardHeader className="p-0 cursor-pointer flex-shrink-0 relative h-[100px] sm:h-[120px] md:h-[140px]">
                          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
                            {(product.main_image_url || product.image_url) ? (
                              <img
                                src={product.main_image_url || product.image_url}
                                alt={product.name}
                                loading="lazy"
                                decoding="async"
                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                          </div>
                          {product.categories?.name && (
                            <div className="absolute top-1.5 left-1.5 z-10">
                              <Badge variant="secondary" className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-emerald-500/90 text-white border-0 backdrop-blur-sm shadow-sm">
                                {product.categories.name}
                              </Badge>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="p-2 sm:p-2.5 flex-1 flex flex-col min-h-0">
                          <CardTitle 
                            className="text-xs sm:text-sm font-semibold mb-1.5 line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors text-gray-900 leading-tight"
                            onClick={() => handleSuggestionClick(product.id)}
                          >
                            {product.name}
                          </CardTitle>
                          <div className="mb-2 space-y-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-base sm:text-lg font-bold text-emerald-600">₹{product.price}</span>
                              {product.unit && (
                                <span className="text-[9px] sm:text-[10px] text-gray-500">/{product.unit}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any products matching "{debouncedSearch}"
                  </p>
                  <Button onClick={() => navigate('/products')} variant="outline">
                    Browse All Products
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

