import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  ShoppingBag, 
  Truck, 
  Smartphone, 
  Zap, 
  Users,
  Award,
  TrendingUp,
  Globe,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Portfolio = () => {
  const projects = [
    {
      title: 'Quick Commerce Platform',
      description: 'A comprehensive e-commerce platform enabling ultra-fast grocery delivery with real-time inventory management, order tracking, and multi-vendor support.',
      icon: ShoppingBag,
      technologies: ['React', 'TypeScript', 'Supabase', 'Real-time APIs'],
      achievements: ['10-15 min delivery', '1000+ products', 'Multi-vendor support']
    },
    {
      title: 'Mobile Application',
      description: 'Native mobile app providing seamless shopping experience with push notifications, real-time order tracking, and secure payment integration.',
      icon: Smartphone,
      technologies: ['React Native', 'Mobile Optimization', 'Push Notifications'],
      achievements: ['iOS & Android', 'Real-time updates', 'Secure payments']
    },
    {
      title: 'Delivery Management System',
      description: 'Advanced logistics and delivery management system with route optimization, real-time tracking, and delivery partner coordination.',
      icon: Truck,
      technologies: ['Route Optimization', 'GPS Tracking', 'Real-time Updates'],
      achievements: ['Fast delivery', 'Route optimization', 'Live tracking']
    },
    {
      title: 'Vendor Dashboard',
      description: 'Comprehensive vendor management platform allowing vendors to manage inventory, orders, analytics, and customer interactions.',
      icon: Users,
      technologies: ['Dashboard Analytics', 'Inventory Management', 'Order Processing'],
      achievements: ['Easy onboarding', 'Real-time analytics', 'Order management']
    },
    {
      title: 'Technology Infrastructure',
      description: 'Scalable cloud infrastructure supporting high traffic, real-time operations, and seamless user experience across all platforms.',
      icon: Code,
      technologies: ['Cloud Infrastructure', 'Scalable Architecture', 'API Integration'],
      achievements: ['High availability', 'Scalable system', 'Fast performance']
    },
    {
      title: 'Customer Experience Platform',
      description: 'Integrated customer experience platform with personalized recommendations, wishlist, reviews, and seamless checkout process.',
      icon: Award,
      technologies: ['Personalization', 'Recommendation Engine', 'User Analytics'],
      achievements: ['Personalized experience', 'Smart recommendations', 'Easy checkout']
    }
  ];

  const stats = [
    { label: 'Products Available', value: '1000+', icon: ShoppingBag },
    { label: 'Average Delivery Time', value: '10-15 min', icon: Zap },
    { label: 'Cities Served', value: 'Multiple', icon: Globe },
    { label: 'Customer Satisfaction', value: 'High', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Portfolio - Kasshit | Projects & Achievements | Technology Solutions"
        description="Explore Kasshit's portfolio of technology projects and achievements. Quick commerce platform, mobile apps, delivery systems, and innovative solutions."
        keywords="kasshit portfolio, technology projects, quick commerce platform, mobile app development, delivery management system"
        canonical="https://www.kasshit.in/portfolio"
      />
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Our Portfolio
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Showcasing Our Technology Projects & Achievements
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-emerald-600 mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Key Projects & Solutions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const Icon = project.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Technologies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Key Achievements:</h4>
                      <ul className="space-y-1">
                        {project.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Achievements Section */}
        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-4 flex items-center justify-center gap-2">
              <Award className="h-8 w-8 text-emerald-600" />
              Our Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50 rounded-lg">
                <TrendingUp className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Rapid Growth</h3>
                <p className="text-muted-foreground">
                  Successfully launched and scaled a quick commerce platform serving multiple cities with thousands of satisfied customers.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <Zap className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Technology Innovation</h3>
                <p className="text-muted-foreground">
                  Built cutting-edge technology solutions including AI-powered inventory management, route optimization, and real-time tracking systems.
                </p>
              </div>
              <div className="p-6 bg-emerald-50 rounded-lg">
                <Users className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Vendor Network</h3>
                <p className="text-muted-foreground">
                  Established a strong network of verified vendors, providing them with tools and support to grow their businesses.
                </p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <Globe className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Market Expansion</h3>
                <p className="text-muted-foreground">
                  Successfully expanded operations across multiple cities in India, with plans for nationwide coverage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-4">Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <Code className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Frontend</h3>
                <p className="text-sm text-muted-foreground">React, TypeScript, Tailwind CSS</p>
              </div>
              <div className="text-center p-4">
                <Code className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Backend</h3>
                <p className="text-sm text-muted-foreground">Supabase, Edge Functions</p>
              </div>
              <div className="text-center p-4">
                <Code className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Mobile</h3>
                <p className="text-sm text-muted-foreground">React Native, PWA</p>
              </div>
              <div className="text-center p-4">
                <Code className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Infrastructure</h3>
                <p className="text-sm text-muted-foreground">Cloud, Real-time APIs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg">
          <CardContent className="pt-6 text-center py-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Interested in Our Work?</h2>
            <p className="text-xl mb-8 text-emerald-50">
              Explore our services or get in touch to discuss your project
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services">
                <Button size="lg" variant="secondary" className="text-emerald-600">
                  View Services
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
                  Contact Us
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;

