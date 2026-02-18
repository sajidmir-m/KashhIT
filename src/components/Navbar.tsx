import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Store, Package, Truck, Shield, Menu, X, Search, ChevronDown, Loader2, Code, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const Navbar = () => {
  const { user, signOut, userRoles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync search query with URL when on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const urlQuery = params.get('q') || '';
      if (urlQuery !== searchQuery) {
        setSearchQuery(urlQuery);
      }
    }
  }, [location.pathname, location.search]);

  // Update URL when search query changes on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const urlQuery = params.get('q') || '';
      if (searchQuery !== urlQuery) {
        const newParams = new URLSearchParams();
        if (searchQuery.trim()) {
          newParams.set('q', searchQuery.trim());
        }
        navigate(`/search?${newParams.toString()}`, { replace: true });
      }
    }
  }, [searchQuery, location.pathname, navigate]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = userRoles.includes('admin');
  const isVendor = userRoles.includes('vendor');
  const isDelivery = userRoles.includes('delivery');

  // Fetch user's default address for delivery info
  const { data: defaultAddress } = useQuery({
    queryKey: ['default-address', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('full_address, city, state, pincode')
        .eq('user_id', user!.id)
        .eq('is_default', true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const deliveryAddress = defaultAddress 
    ? `${defaultAddress.full_address || ''}, ${defaultAddress.city || ''}, ${defaultAddress.state || ''} - ${defaultAddress.pincode || ''}`.slice(0, 40) + (defaultAddress.full_address && defaultAddress.full_address.length > 40 ? '...' : '')
    : 'Select delivery location';

  // Fetch search suggestions
  const { data: searchSuggestions, isLoading: isSearching } = useQuery({
    queryKey: ['search-suggestions', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.trim().length < 1) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, main_image_url, categories(name)')
        .eq('is_approved', true)
        .eq('is_active', true)
        .ilike('name', `%${debouncedSearch.trim()}%`)
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: debouncedSearch.trim().length >= 1,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${productId}`);
  };

  // Check if we're on IoT Tools category page
  const { data: iotToolsCategory } = useQuery({
    queryKey: ['iot-tools-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('name', 'IoT Tools')
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Check if current page is IoT Tools category
  const [showExploreProjects, setShowExploreProjects] = useState(false);

  useEffect(() => {
    if (location.pathname === '/products' && iotToolsCategory) {
      const params = new URLSearchParams(location.search);
      const categoryId = params.get('category');
      setShowExploreProjects(categoryId === iotToolsCategory.id);
    } else {
      setShowExploreProjects(false);
    }
  }, [location.pathname, location.search, iotToolsCategory]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-2 sm:px-3 md:px-4 lg:px-6">
        {/* Main Header Row */}
        <div className="flex h-14 sm:h-16 md:h-18 items-center gap-2 sm:gap-3 md:gap-4 justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <img src="/logo.png" alt="Kassh.IT" className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 object-contain" />
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
              <span className="text-emerald-600">Kassh</span>
              <span className="text-green-600">.IT</span>
            </span>
          </Link>

          {/* Delivery Info - Mobile & Desktop */}
          {user && (
            <div className="flex flex-col flex-shrink-0 min-w-0">
              <div className="hidden lg:flex items-center gap-1">
                <span className="text-xs font-medium text-gray-700">Delivery in 15 minutes</span>
              </div>
              <div className="lg:hidden flex items-center gap-1">
                <span className="text-[10px] xs:text-xs font-medium text-gray-700">15 min</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-left hover:text-emerald-600 transition-colors">
                    <span className="text-[10px] xs:text-xs lg:text-xs text-gray-600 truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[120px] lg:max-w-[180px] xl:max-w-[220px]">
                      {deliveryAddress}
                    </span>
                    <ChevronDown className="h-2.5 w-2.5 xs:h-3 xs:w-3 lg:h-3 lg:w-3 text-gray-600 flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Package className="mr-2 h-4 w-4" />
                    Change Delivery Location
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Search Bar - Desktop Only */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 min-w-0 max-w-2xl mx-1 sm:mx-2 md:mx-4">
            <div className="relative w-full" ref={searchRef}>
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 z-10" />
              {isSearching && searchQuery.trim().length >= 1 && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin z-10" />
              )}
              <Input
                type="text"
                placeholder='Search "products"'
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  // Update URL if on search page
                  if (location.pathname === '/search') {
                    const params = new URLSearchParams();
                    if (value.trim()) {
                      params.set('q', value.trim());
                    }
                    navigate(`/search?${params.toString()}`, { replace: true });
                  }
                }}
                onFocus={(e) => {
                  const currentPath = location.pathname;
                  if (currentPath !== '/search') {
                    navigate('/search');
                  }
                }}
                className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 h-9 sm:h-10 md:h-12 text-sm sm:text-base bg-gray-100 border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
              />
            </div>
          </form>

          {/* Right Side Actions - Desktop */}
          <div className="hidden lg:flex items-center space-x-1.5 sm:space-x-2 xl:space-x-3 flex-shrink-0 ml-auto">
            {showExploreProjects && (
              <Link to="/explore-projects">
                <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm whitespace-nowrap text-white">
                  <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 md:mr-2 flex-shrink-0" />
                  <span className="font-medium">Explore Projects</span>
                </Button>
              </Link>
            )}
            {user ? (
              <>
                <Link to="/wishlist">
                  <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 md:mr-2 flex-shrink-0" />
                    <span className="font-medium hidden sm:inline">Wishlist</span>
                    <span className="font-medium sm:hidden">Wish</span>
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 md:mr-2 flex-shrink-0" />
                    <span className="font-medium hidden sm:inline">My Cart</span>
                    <span className="font-medium sm:hidden">Cart</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                        <Badge variant="destructive" className="ml-auto text-xs">Admin</Badge>
                      </DropdownMenuItem>
                    )}
                    
                    {isVendor && (
                      <DropdownMenuItem onClick={() => navigate('/vendor')}>
                        <Store className="mr-2 h-4 w-4" />
                        Vendor Panel
                        <Badge variant="secondary" className="ml-auto text-xs">Vendor</Badge>
                      </DropdownMenuItem>
                    )}
                    
                    {isDelivery && (
                      <DropdownMenuItem onClick={() => navigate('/delivery')}>
                        <Truck className="mr-2 h-4 w-4" />
                        Delivery Panel
                        <Badge className="ml-auto bg-primary text-xs">Delivery</Badge>
                      </DropdownMenuItem>
                    )}
                    
                    {(isAdmin || isVendor || isDelivery) && <DropdownMenuSeparator />}
                    
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm font-medium px-2 sm:px-3 whitespace-nowrap">
                    Login
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 md:mr-2 flex-shrink-0" />
                    <span className="font-medium hidden sm:inline">My Cart</span>
                    <span className="font-medium sm:hidden">Cart</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile - Sign In Button / Profile Icon */}
          <div className="lg:hidden flex items-center space-x-1 sm:space-x-2 ml-auto">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate('/orders'); setIsMobileMenuOpen(false); }}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate('/wishlist'); setIsMobileMenuOpen(false); }}>
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                      <Badge variant="destructive" className="ml-auto text-xs">Admin</Badge>
                    </DropdownMenuItem>
                  )}
                  
                  {isVendor && (
                    <DropdownMenuItem onClick={() => { navigate('/vendor'); setIsMobileMenuOpen(false); }}>
                      <Store className="mr-2 h-4 w-4" />
                      Vendor Panel
                      <Badge variant="secondary" className="ml-auto text-xs">Vendor</Badge>
                    </DropdownMenuItem>
                  )}
                  
                  {isDelivery && (
                    <DropdownMenuItem onClick={() => { navigate('/delivery'); setIsMobileMenuOpen(false); }}>
                      <Truck className="mr-2 h-4 w-4" />
                      Delivery Panel
                      <Badge className="ml-auto bg-primary text-xs">Delivery</Badge>
                    </DropdownMenuItem>
                  )}
                  
                  {(isAdmin || isVendor || isDelivery) && <DropdownMenuSeparator />}
                  
                  <DropdownMenuItem onClick={() => { signOut(); setIsMobileMenuOpen(false); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="h-8 w-auto px-2 sm:px-3 text-xs sm:text-sm font-medium">
                  Sign In
                </Button>
              </Link>
            )}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
          </div>
        </div>

        {/* Explore Projects Tab - Show when on IoT Tools category */}
        {showExploreProjects && (
          <div className="border-t bg-emerald-50 px-2 sm:px-3 py-2">
            <Link to="/explore-projects">
              <Button variant="ghost" className="w-full justify-center text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100">
                <Code className="mr-2 h-4 w-4" />
                Explore Projects
              </Button>
            </Link>
          </div>
        )}

        {/* Mobile Search Bar - Below Header */}
        <div className="lg:hidden border-t bg-white px-2 sm:px-3 py-2">
          <form onSubmit={handleSearch}>
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              {isSearching && searchQuery.trim().length >= 1 && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin z-10" />
              )}
              <Input
                type="text"
                placeholder='Search "products"'
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  // Update URL if on search page
                  if (location.pathname === '/search') {
                    const params = new URLSearchParams();
                    if (value.trim()) {
                      params.set('q', value.trim());
                    }
                    navigate(`/search?${params.toString()}`, { replace: true });
                  }
                }}
                onFocus={(e) => {
                  const currentPath = location.pathname;
                  if (currentPath !== '/search') {
                    navigate('/search');
                  }
                }}
                className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 h-9 sm:h-10 text-sm bg-gray-100 border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
              />
            </div>
          </form>
        </div>

          {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="px-2 sm:px-3 py-3 space-y-1">


              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Products
                </Button>
              </Link>
              <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Categories
                </Button>
              </Link>
              {showExploreProjects && (
                <Link to="/explore-projects" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Code className="mr-2 h-4 w-4" />
                    Explore Projects
                  </Button>
                </Link>
              )}
              
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Button>
                  </Link>
                  
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm"
                      onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                      <Badge variant="destructive" className="ml-auto text-xs">Admin</Badge>
                    </Button>
                  )}
                  
                  {isVendor && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm"
                      onClick={() => { navigate('/vendor'); setIsMobileMenuOpen(false); }}
                    >
                      <Store className="mr-2 h-4 w-4" />
                      Vendor Panel
                      <Badge variant="secondary" className="ml-auto text-xs">Vendor</Badge>
                    </Button>
                  )}
                  
                  {isDelivery && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm"
                      onClick={() => { navigate('/delivery'); setIsMobileMenuOpen(false); }}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Delivery Panel
                      <Badge className="ml-auto bg-primary text-xs">Delivery</Badge>
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm text-destructive"
                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full text-sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
