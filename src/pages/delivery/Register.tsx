import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

const DeliveryRegister = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <CardTitle>Delivery Partner Registration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Delivery partner accounts are now created by Admin only.
            </p>
            <div className="rounded-md border p-3 text-sm bg-muted/30">
              <div className="font-medium mb-1">What to do</div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Contact Admin to create your delivery login.</li>
                <li>You will receive your email + password on your registered email address.</li>
                <li>Login at <span className="font-mono">https://www.kasshit.in/auth</span> and open the Delivery Dashboard.</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Support: <span className="font-mono">kasshit_1@zohomail.in</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryRegister;


