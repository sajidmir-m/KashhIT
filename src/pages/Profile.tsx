import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Edit, Save, X, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { AddressList } from '@/components/AddressList';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const queryClient = useQueryClient();


  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
  });

  // Update profile form when profile data loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (payload: { full_name: string; phone: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">My Profile</h1>

        <div className="max-w-2xl">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 md:p-4 bg-primary/10 rounded-full">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg md:text-xl truncate">{profile?.full_name || 'User'}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <h3 className="text-base sm:text-lg font-semibold">Personal Information</h3>
                {!isEditingProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Edit
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateProfile.mutate(profileForm)}
                      disabled={updateProfile.isPending || !profileForm.full_name.trim()}
                      className="w-full sm:w-auto"
                    >
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileForm({
                          full_name: profile?.full_name || '',
                          phone: profile?.phone || '',
                        });
                      }}
                      className="w-full sm:w-auto"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Cancel
                    </Button>
                  </div>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Full Name</label>
                    <Input
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Phone Number</label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-sm sm:text-base sm:text-lg">{profile?.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm sm:text-base sm:text-lg">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Account Status</label>
                <p className="text-sm sm:text-base sm:text-lg">{profile?.is_verified ? 'Verified' : 'Not Verified'}</p>
              </div>

              {(!profile?.full_name || !profile?.phone) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-yellow-800">
                    <strong>Complete your profile:</strong> Please add your full name and phone number to ensure proper order processing and delivery.
                  </p>
                </div>
              )}

              <div className="pt-3 sm:pt-4">
                <Button onClick={() => navigate('/orders')} className="w-full sm:w-auto text-sm sm:text-base">View Orders</Button>
              </div>
            </CardContent>
          </Card>

          <AddressList />
        </div>
      </div>
    </div>
  );
};

export default Profile;
