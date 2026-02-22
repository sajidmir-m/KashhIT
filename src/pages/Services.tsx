import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingBag, 
  Truck, 
  Zap, 
  Shield, 
  Package, 
  Store, 
  Users, 
  Code, 
  Smartphone,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Services = () => {
  const services = [
    {
      icon: ShoppingBag,
      title: 'Quick Grocery Delivery',
      description: 'Get fresh groceries delivered to your doorstep in 10-15 minutes. We offer a wide range of products including fruits, vegetables, dairy, grains, and more.',
      features: ['10-15 minute delivery', 'Fresh produce', 'Wide product range', 'Quality assured']
    },
    {
      icon: Package,
      title: 'Daily Essentials',
      description: 'Everything you need for daily life - personal care, household items, baby care, stationery, and more. All available at competitive prices.',
      features: ['Personal care products', 'Household essentials', 'Baby care items', 'Stationery & more']
    },
    {
      icon: Store,
      title: 'Multi-Vendor Marketplace',
      description: 'Connect with multiple verified vendors through our platform. We ensure quality, competitive pricing, and reliable service from all our partners.',
      features: ['Verified vendors', 'Competitive pricing', 'Quality assurance', 'Reliable service']
    },
    {
      icon: Truck,
      title: 'Fast Delivery Network',
      description: 'Our optimized delivery network ensures your orders reach you quickly. We use advanced route optimization and real-time tracking.',
      features: ['Route optimization', 'Real-time tracking', 'Multiple delivery slots', 'Express delivery']
    },
    {
      icon: Smartphone,
      title: 'Mobile App & Web Platform',
      description: 'Shop conveniently from our user-friendly mobile app or web platform. Easy navigation, secure payments, and seamless shopping experience.',
      features: ['Mobile app', 'Web platform', 'Easy navigation', 'Secure payments']
    },
    {
      icon: Code,
      title: 'Technology Solutions',
      description: 'We provide technology solutions for vendors and businesses looking to digitize their operations and reach more customers.',
      features: ['Vendor platform', 'Inventory management', 'Order tracking', 'Analytics dashboard']
    },
    {
      icon: Users,
      title: 'Vendor Onboarding',
      description: 'Join our platform as a vendor and expand your business reach. We provide tools, support, and a ready customer base.',
      features: ['Easy onboarding', 'Business tools', 'Customer support', 'Marketing support']
    },
    {
      icon: Shield,
      title: 'Secure Payment Solutions',
      description: 'Multiple secure payment options including UPI, cards, wallets, and cash on delivery. Your transactions are safe and protected.',
      features: ['UPI payments', 'Card payments', 'Digital wallets', 'Cash on delivery']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Services - Kasshit | Quick Commerce Solutions | Grocery Delivery Services"
        description="Explore Kasshit's comprehensive services including quick grocery delivery, daily essentials, vendor marketplace, technology solutions, and more. Fast, reliable, and technology-driven."
        keywords="kasshit services, quick commerce services, grocery delivery services, vendor marketplace, technology solutions, fast delivery India"
        canonical="https://www.kasshit.in/services"
      />
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Our Services
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive Quick Commerce Solutions Powered by Technology
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Key Features Section */}
        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-4">Why Choose Our Services?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <Clock className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">10-15 minute delivery guaranteed</p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Secure & Safe</h3>
                <p className="text-sm text-muted-foreground">Secure payments and data protection</p>
              </div>
              <div className="text-center">
                <Zap className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Technology-Driven</h3>
                <p className="text-sm text-muted-foreground">AI-powered optimization and efficiency</p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Quality Assured</h3>
                <p className="text-sm text-muted-foreground">Every product quality-checked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg">
          <CardContent className="pt-6 text-center py-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Experience Our Services?</h2>
            <p className="text-xl mb-8 text-emerald-50">
              Start shopping now or join us as a vendor partner
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" variant="secondary" className="text-emerald-600">
                  Start Shopping
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
                  Become a Vendor
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Services;

