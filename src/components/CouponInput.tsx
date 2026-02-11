import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface CouponInputProps {
  subtotal: number;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
}

export const CouponInput = ({ subtotal, onCouponApplied, onCouponRemoved }: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const applyCouponMutation = useMutation({
    mutationFn: async () => {
      if (!couponCode.trim()) {
        throw new Error('Please enter a coupon code');
      }

      // Fetch coupon
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Invalid coupon code');
        }
        throw error;
      }

      if (!coupon) {
        throw new Error('Invalid coupon code');
      }

      // Validate coupon
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = new Date(coupon.valid_until);

      if (now < validFrom) {
        throw new Error('Coupon is not yet valid');
      }

      if (now > validUntil) {
        throw new Error('Coupon has expired');
      }

      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        throw new Error('Coupon usage limit reached');
      }

      if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
        throw new Error(`Minimum order amount of ₹${coupon.min_order_amount} required`);
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (subtotal * coupon.discount_value) / 100;
        if (coupon.max_discount) {
          discount = Math.min(discount, coupon.max_discount);
        }
      } else {
        discount = coupon.discount_value;
      }

      // Ensure discount doesn't exceed subtotal
      discount = Math.min(discount, subtotal);

      // Increment usage count
      await supabase
        .from('coupons')
        .update({ usage_count: (coupon.usage_count || 0) + 1 })
        .eq('id', coupon.id);

      return {
        code: coupon.code,
        discount: Number(discount.toFixed(2)),
      };
    },
    onSuccess: (result) => {
      setAppliedCoupon(result);
      onCouponApplied(result.discount, result.code);
      toast.success(`Coupon "${result.code}" applied! Saved ₹${result.discount.toFixed(2)}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to apply coupon');
    },
  });

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onCouponRemoved();
    toast.info('Coupon removed');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="coupon-code" className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Coupon Code
      </Label>
      {appliedCoupon ? (
        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">{appliedCoupon.code}</span>
            <span className="text-xs text-green-600">- ₹{appliedCoupon.discount.toFixed(2)}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            id="coupon-code"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1"
            disabled={applyCouponMutation.isPending}
          />
          <Button
            type="button"
            onClick={() => applyCouponMutation.mutate()}
            disabled={applyCouponMutation.isPending || !couponCode.trim()}
            variant="outline"
          >
            {applyCouponMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

