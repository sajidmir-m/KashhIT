import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Shield, Zap, Heart, Target, Users, Award, Globe, Code, Building2, CheckCircle, Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About Kasshit - Fast Grocery Delivery | Quick Commerce India"
        description="Learn about Kasshit, India's trusted quick commerce platform delivering fresh groceries and daily essentials in minutes. Our mission, values, and commitment to quality."
        keywords="about kasshit, quick commerce India, grocery delivery company, fast delivery service, online grocery platform"
        canonical="https://www.kasshit.in/about"
      />
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            About Kasshit
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionizing Quick Commerce in India - Delivering Fresh Groceries & Daily Essentials at Lightning Speed
          </p>
        </div>

        {/* Business Model & Owner Section */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Building2 className="h-12 w-12 text-emerald-600 mb-4" />
                <h2 className="text-3xl font-bold mb-4">What is Kasshit?</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  <strong>Kasshit</strong> is a technology-driven quick commerce platform that combines the power of modern e-commerce with lightning-fast delivery. We're not just a grocery platform—we're a tech company revolutionizing how India shops for daily essentials.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  Our business model focuses on:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li><strong>Quick Commerce:</strong> Ultra-fast delivery of groceries and essentials in 10-15 minutes</li>
                  <li><strong>Technology Integration:</strong> AI-powered inventory management, route optimization, and demand forecasting</li>
                  <li><strong>Multi-Vendor Platform:</strong> Connecting local vendors with customers through our digital marketplace</li>
                  <li><strong>Scalable Operations:</strong> Expanding across multiple cities in India with consistent service quality</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-lg">
                <div className="text-center mb-6">
                  <Users className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">Founder & Owner</h3>
                  <p className="text-xl font-bold text-emerald-700 mb-2">Sajid Nazir Mir</p>
                  <p className="text-muted-foreground mb-4">Computer Science Engineer</p>
                </div>
                <p className="text-muted-foreground text-center mb-4">
                  With a strong background in computer science and engineering, Sajid Nazir Mir founded Kasshit to bridge the gap between technology and everyday convenience. His vision is to make quality groceries and daily essentials accessible to everyone through innovative technology solutions.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Code className="h-4 w-4" />
                  <span>Technology-Driven Quick Commerce</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-4">Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                  Business Details
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Company Name:</strong> Kasshit</li>
                  <li><strong>Business Type:</strong> Quick Commerce Platform</li>
                  <li><strong>Industry:</strong> E-commerce & Technology</li>
                  <li><strong>Founded:</strong> Technology-driven startup</li>
                  <li><strong>Operations:</strong> India (Expanding nationwide)</li>
                </ul>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-emerald-600" />
                  Service Areas
                </h3>
                <p className="text-muted-foreground mb-3">
                  Currently operating in select cities across India, with rapid expansion plans:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Multiple cities across India</li>
                  <li>✓ Expanding to new locations regularly</li>
                  <li>✓ 24/7 customer support</li>
                  <li>✓ Fast delivery network</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission Section */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Target className="h-12 w-12 text-emerald-600 mb-4" />
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  At Kasshit, we're on a mission to transform how India shops for daily essentials. We believe that quality groceries, household products, and fresh produce should be accessible to everyone, delivered to your doorstep within minutes—not hours or days.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We're building a trusted platform that combines cutting-edge technology with local expertise to ensure you get the best products at competitive prices, delivered fast and fresh.
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">Why Choose Kasshit?</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Ultra-Fast Delivery:</strong> Get your orders delivered in minutes, not days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Quality Assured:</strong> Every product is carefully selected and quality-checked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Customer First:</strong> Your satisfaction is our top priority</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Globe className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Scalable Growth:</strong> Expanding to serve multiple cities across India</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-8">Our Core Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg border">
                <Truck className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Speed & Efficiency</h3>
                <p className="text-muted-foreground">
                  We optimize every step of our supply chain to ensure your orders reach you as quickly as possible without compromising on quality.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border">
                <Shield className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Trust & Transparency</h3>
                <p className="text-muted-foreground">
                  We maintain complete transparency in pricing, product quality, and delivery timelines. Your trust is our most valuable asset.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border">
                <Heart className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Customer Centricity</h3>
                <p className="text-muted-foreground">
                  Every decision we make is driven by what's best for our customers. Your feedback shapes our platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We Offer Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-8">What We Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Fresh Groceries</h3>
                <p className="text-muted-foreground mb-4">
                  From fresh fruits and vegetables to dairy products, grains, and spices—we source the finest quality produce directly from trusted suppliers.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Fresh fruits & vegetables</li>
                  <li>Dairy products & eggs</li>
                  <li>Grains, pulses & spices</li>
                  <li>Organic & premium selections</li>
                </ul>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Daily Essentials</h3>
                <p className="text-muted-foreground mb-4">
                  Everything you need for your daily life, from personal care to household cleaning supplies, all available at your fingertips.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Personal care products</li>
                  <li>Household cleaning supplies</li>
                  <li>Baby care essentials</li>
                  <li>Stationery & home items</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology & Innovation */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <Zap className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Technology-Driven Excellence</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Kasshit leverages advanced technology to streamline operations, optimize delivery routes, and ensure real-time inventory management. Our AI-powered systems help us predict demand, reduce waste, and maintain the freshest stock for our customers.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-emerald-600 mb-2">10+</div>
                <div className="text-muted-foreground">Minutes Average Delivery</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-emerald-600 mb-2">1000+</div>
                <div className="text-muted-foreground">Products Available</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
                <div className="text-muted-foreground">Customer Support</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-4 flex items-center justify-center gap-2">
              <Users className="h-8 w-8 text-emerald-600" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8">
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our team is composed of passionate professionals dedicated to delivering excellence in quick commerce. Led by experienced engineers and business professionals, we're building the future of grocery delivery in India.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg border bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="h-20 w-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Technology Team</h3>
                <p className="text-muted-foreground">
                  Skilled engineers and developers building innovative solutions for seamless shopping experiences.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="h-20 w-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Operations Team</h3>
                <p className="text-muted-foreground">
                  Logistics experts ensuring fast and reliable delivery to your doorstep.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg border bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="h-20 w-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Customer Support</h3>
                <p className="text-muted-foreground">
                  Dedicated support team available 24/7 to assist you with any queries or concerns.
                </p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link to="/career">
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  Join Our Team
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Trust Elements - Testimonials & Reviews */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-4 flex items-center justify-center gap-2">
              <Star className="h-8 w-8 text-emerald-600" />
              What Our Customers Say
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border bg-white">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-emerald-600 mb-3" />
                <p className="text-muted-foreground mb-4 italic">
                  "Kasshit has transformed how I shop for groceries. The delivery is incredibly fast, and the quality is always excellent. Highly recommended!"
                </p>
                <p className="font-semibold">- Priya S.</p>
                <p className="text-sm text-muted-foreground">Regular Customer</p>
              </div>
              <div className="p-6 rounded-lg border bg-white">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-emerald-600 mb-3" />
                <p className="text-muted-foreground mb-4 italic">
                  "The app is user-friendly, and I love the variety of products available. Delivery within minutes is a game-changer!"
                </p>
                <p className="font-semibold">- Rajesh K.</p>
                <p className="text-sm text-muted-foreground">Verified Buyer</p>
              </div>
              <div className="p-6 rounded-lg border bg-white">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-emerald-600 mb-3" />
                <p className="text-muted-foreground mb-4 italic">
                  "Best quick commerce platform I've used. Fresh products, fast delivery, and great customer service. Keep up the excellent work!"
                </p>
                <p className="font-semibold">- Anjali M.</p>
                <p className="text-sm text-muted-foreground">Premium Member</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-4 flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-emerald-600" />
              Why Trust Kasshit?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Verified Vendors</h3>
                <p className="text-sm text-muted-foreground">All vendors are verified and quality-checked</p>
              </div>
              <div className="text-center p-4">
                <Shield className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">Multiple secure payment options available</p>
              </div>
              <div className="text-center p-4">
                <Award className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Quality Assured</h3>
                <p className="text-sm text-muted-foreground">Every product goes through quality checks</p>
              </div>
              <div className="text-center p-4">
                <Zap className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">10-15 minutes average delivery time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth & Future */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Globe className="h-12 w-12 text-emerald-600 mb-4" />
                <h2 className="text-3xl font-bold mb-4">Expanding Across India</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  While we're currently serving select cities, our vision is to become India's most trusted quick commerce platform. We're continuously expanding our reach to bring fast, reliable grocery delivery to more neighborhoods across the country.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our scalable infrastructure and technology-first approach enable us to rapidly expand while maintaining the high standards of service our customers expect.
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">Join Our Journey</h3>
                <p className="text-muted-foreground mb-6">
                  We're always looking for passionate individuals to join our team. Whether you're interested in technology, operations, or customer service, we have opportunities for growth.
                </p>
                <Link to="/career">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    View Career Opportunities
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg">
          <CardContent className="pt-6 text-center py-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Experience Fast, Fresh Delivery?</h2>
            <p className="text-xl mb-8 text-emerald-50">
              Join thousands of satisfied customers who trust Kasshit for their daily essentials
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" variant="secondary" className="text-emerald-600">
                  Start Shopping Now
                </Button>
              </Link>
              <Link to="/profile">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-8 text-center text-muted-foreground">
          <p className="mb-2">Have questions? We'd love to hear from you!</p>
          <p>
            Email: <a href="mailto:kasshit_1@zohomail.in" className="text-emerald-600 hover:underline">kasshit_1@zohomail.in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;

