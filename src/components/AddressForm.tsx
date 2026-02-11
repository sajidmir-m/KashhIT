import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Save, X, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { lookupPincode, isValidPincode } from '@/lib/pincodeLookup';
import { LocationPickerMap } from '@/components/LocationPickerMap';
import {
  checkPincodeServiceability,
  type ServiceabilityResult,
} from '@/lib/serviceAvailability';

interface AddressFormData {
  label: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
}

interface AddressFormProps {
  address?: AddressFormData & { id: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddressForm = ({ address, onSuccess, onCancel }: AddressFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AddressFormData>({
    label: '',
    full_address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    is_default: false,
    latitude: undefined,
    longitude: undefined,
  });
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);
  const [serviceability, setServiceability] = useState<ServiceabilityResult | null>(null);

  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label,
        full_address: address.full_address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        is_default: address.is_default,
        latitude: address.latitude,
        longitude: address.longitude,
      });
    }
  }, [address]);

  // Auto-lookup pincode when it changes
  useEffect(() => {
    const pincode = formData.pincode.trim();

    // Reset coordinates if pincode is cleared
    if (!pincode) {
      setFormData(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
      setServiceability(null);
      return;
    }

    // Always compute local serviceability when a full pincode is present
    if (pincode.length === 6) {
      setServiceability(checkPincodeServiceability(pincode));
    } else {
      setServiceability(null);
    }

    // Only lookup if pincode is valid (6 digits) and different from current
    if (isValidPincode(pincode)) {
      const lookupPincodeData = async () => {
        setIsLookingUpPincode(true);
        try {
          const data = await lookupPincode(pincode);

          if (data) {
            // Auto-fill city and state if they're empty
            // Also update coordinates to center the map on the pincode area
            setFormData(prev => ({
              ...prev,
              city: prev.city || data.city,
              state: prev.state || data.state,
              latitude: data.latitude,
              longitude: data.longitude,
            }));

            toast.success(`Location found for pincode ${pincode}`);
          } else {
            toast.error('Could not find location for this pincode');
          }
        } catch (error) {
          console.error('Pincode lookup error:', error);
          toast.error('Failed to lookup pincode');
        } finally {
          setIsLookingUpPincode(false);
        }
      };

      // Debounce: wait 800ms after user stops typing
      const timeoutId = setTimeout(lookupPincodeData, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.pincode]);

  const saveAddress = useMutation({
    mutationFn: async (data: AddressFormData) => {
      if (!user) throw new Error('User not authenticated');

      // Soft-validate pincode serviceability on save so users are aware.
      // Checkout will strictly block orders going to out-of-service pincodes.
      if (data.pincode) {
        const { isServiceable } = checkPincodeServiceability(data.pincode);
        if (!isServiceable) {
          toast.warning(
            'This pincode is currently outside our delivery area. You can save the address, but checkout may be blocked for this location.'
          );
        }
      }

      // If setting as default, first unset any existing default
      if (data.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      if (address) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            label: data.label,
            full_address: data.full_address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            phone: data.phone,
            is_default: data.is_default,
            latitude: data.latitude,
            longitude: data.longitude,
          })
          .eq('id', address.id);

        if (error) throw error;
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            label: data.label,
            full_address: data.full_address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            phone: data.phone,
            is_default: data.is_default,
            latitude: data.latitude,
            longitude: data.longitude,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(address ? 'Address updated successfully' : 'Address added successfully');
      queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save address');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.label.trim()) {
      toast.error('Please enter a label for the address');
      return;
    }
    if (!formData.full_address.trim()) {
      toast.error('Please enter the full address');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter the city');
      return;
    }
    if (!formData.state.trim()) {
      toast.error('Please enter the state');
      return;
    }
    if (!formData.pincode.trim()) {
      toast.error('Please enter the pincode');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter the phone number');
      return;
    }

    saveAddress.mutate(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {address ? 'Edit Address' : 'Add New Address'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Address Label *</Label>
            <Input
              id="label"
              placeholder="e.g., Home, Office, Work"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              required
            />
          </div>

          {/* Full Address */}
          <div className="space-y-2">
            <Label htmlFor="full_address">Full Address *</Label>
            <Textarea
              id="full_address"
              placeholder="Enter complete address with house number, street, area..."
              value={formData.full_address}
              onChange={(e) => setFormData(prev => ({ ...prev, full_address: e.target.value }))}
              rows={3}
              required
            />
          </div>

          {/* City, State, Pincode Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <div className="relative">
                <Input
                  id="pincode"
                  placeholder="Enter 6-digit pincode"
                  value={formData.pincode}
                  onChange={(e) => {
                    // Only allow numbers and limit to 6 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData(prev => ({ ...prev, pincode: value }));
                  }}
                  maxLength={6}
                  required
                  className={isLookingUpPincode ? 'pr-10' : ''}
                />
                {isLookingUpPincode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {formData.pincode.length === 6 && !isLookingUpPincode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              {formData.pincode.length > 0 && formData.pincode.length < 6 && (
                <p className="text-xs text-muted-foreground">
                  Enter 6-digit pincode to auto-fill location
                </p>
              )}
              {formData.pincode.length === 6 && serviceability && (
                <p
                  className={`text-xs ${
                    serviceability.isServiceable ? 'text-emerald-600' : 'text-destructive'
                  }`}
                >
                  {serviceability.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          {/* Location Picker Map */}
          <div className="space-y-4 pt-2">
            <LocationPickerMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationSelect={(lat, lon) => {
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
                // Optional: Reverse geocode if address is empty? 
                // For now we just trust the user to fill address or let pincode fill it.
              }}
            />

            {formData.latitude && formData.longitude && (
              <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Selected Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Default Address Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
            />
            <Label htmlFor="is_default" className="text-sm">
              Set as default address
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={saveAddress.isPending}
              className="flex-1 sm:flex-none"
            >
              {saveAddress.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saveAddress.isPending ? 'Saving...' : (address ? 'Update Address' : 'Add Address')}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 sm:flex-none"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
