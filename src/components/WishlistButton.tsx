import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface WishlistButtonProps {
  productId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const WishlistButton = ({ 
  productId, 
  variant = 'outline',
  size = 'default',
  className 
}: WishlistButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if product is in wishlist
  const { data: isInWishlist } = useQuery({
    queryKey: ['wishlist', productId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user,
  });

  // Toggle wishlist mutationQAW12
  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error('Please login to add items to wishlist');
        navigate('/auth');
        throw new Error('Please login');
      }

      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return false;
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            product_id: productId,
            user_id: user.id,
          });
        
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (added) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', productId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
    },
    onError: (error: any) => {
      if (error.message !== 'Please login') {
        toast.error(error.message || 'Failed to update wishlist');
      }
    },
  });

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => toggleWishlist.mutate()}
      disabled={toggleWishlist.isPending}
      className={className}
    >
      <Heart
        className={`h-4 w-4 ${size === 'icon' ? '' : 'mr-2'} ${
          isInWishlist ? 'fill-red-500 text-red-500' : ''
        }`}
      />
      {size !== 'icon' && (isInWishlist ? 'In Wishlist' : 'Add to Wishlist')}
    </Button>
  );
};

