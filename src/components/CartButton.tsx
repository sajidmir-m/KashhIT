import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CartButtonProps {
  productId: string;
  productStock: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export const CartButton = ({ 
  productId, 
  productStock,
  variant = 'default',
  size = 'default',
  className = '',
  showLabel = true
}: CartButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [localQuantity, setLocalQuantity] = useState(0);

  // Fetch cart item for this product
  const { data: cartItem } = useQuery({
    queryKey: ['cart-item', productId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Sync local quantity with cart
  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity);
    } else {
      setLocalQuantity(0);
    }
  }, [cartItem]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (quantity: number = 1) => {
      if (!user) {
        toast.error('Please login to add items to cart');
        navigate('/auth');
        throw new Error('Please login');
      }

      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, quantity) => {
      setLocalQuantity(quantity);
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['cart-item', productId, user?.id] });
      if (quantity === 1) {
        toast.success('Added to cart!');
      }
    },
    onError: (error: any) => {
      if (error.message !== 'Please login') {
        toast.error(error.message || 'Failed to update cart');
      }
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async (newQuantity: number) => {
      if (!user) {
        toast.error('Please login');
        navigate('/auth');
        throw new Error('Please login');
      }

      if (newQuantity === 0) {
        // Remove from cart
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (error) throw error;
      } else {
        // Update quantity
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();
        
        if (existing) {
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existing.id);
          
          if (error) throw error;
        } else {
          // Insert if doesn't exist
          const { error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity: newQuantity,
            });
          
          if (error) throw error;
        }
      }
    },
    onSuccess: (_, newQuantity) => {
      setLocalQuantity(newQuantity);
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['cart-item', productId, user?.id] });
      
      if (newQuantity === 0) {
        toast.success('Removed from cart');
      }
    },
    onError: (error: any) => {
      if (error.message !== 'Please login') {
        toast.error(error.message || 'Failed to update cart');
      }
    },
  });

  const handleAdd = () => {
    addToCartMutation.mutate(1);
  };

  const handleIncrement = () => {
    if (localQuantity < productStock) {
      updateQuantityMutation.mutate(localQuantity + 1);
    } else {
      toast.error('Maximum stock reached');
    }
  };

  const handleDecrement = () => {
    if (localQuantity > 0) {
      updateQuantityMutation.mutate(localQuantity - 1);
    }
  };

  // Show "Add" button if quantity is 0
  if (localQuantity === 0) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleAdd}
        disabled={addToCartMutation.isPending || productStock === 0}
        className={className}
      >
        <ShoppingCart className={`h-4 w-4 ${showLabel ? 'mr-2' : ''}`} />
        {showLabel && (productStock === 0 ? 'Out of Stock' : 'Add')}
      </Button>
    );
  }

  // Show quantity controller if quantity > 0
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size={size}
        onClick={handleDecrement}
        disabled={updateQuantityMutation.isPending}
        className="h-8 w-8 sm:h-9 sm:w-9 p-0"
      >
        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
      <span className="min-w-[2rem] sm:min-w-[2.5rem] text-center font-semibold text-sm sm:text-base">
        {localQuantity}
      </span>
      <Button
        variant="outline"
        size={size}
        onClick={handleIncrement}
        disabled={updateQuantityMutation.isPending || localQuantity >= productStock}
        className="h-8 w-8 sm:h-9 sm:w-9 p-0"
      >
        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

