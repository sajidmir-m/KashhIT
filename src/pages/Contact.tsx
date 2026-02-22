import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare,
  Send,
  Building2,
  User
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast.success('Thank you for contacting us! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact Us - Kasshit | Get in Touch | Customer Support"
        description="Contact Kasshit for inquiries, support, vendor partnerships, or any questions. We're here to help! Email: kasshit_1@zohomail.in"
        keywords="contact kasshit, kasshit support, customer service, vendor partnership, quick commerce support"
        canonical="https://www.kasshit.in/contact"
      />
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            We'd love to hear from you. Get in touch with us for any inquiries, support, or partnerships.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us more about your inquiry..."
                    className="resize-none"
                  />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a 
                      href="mailto:kasshit_1@zohomail.in" 
                      className="text-emerald-600 hover:underline break-all"
                    >
                      kasshit_1@zohomail.in
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone Support</h3>
                    <p className="text-muted-foreground">
                      Available through email contact
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      For urgent matters, please email us
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-muted-foreground">
                      Operating across multiple cities in India
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Expanding nationwide
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Support Hours</h3>
                    <p className="text-muted-foreground">
                      24/7 Customer Support
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We're always here to help
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="/about" className="block text-emerald-600 hover:underline">
                  About Us
                </a>
                <a href="/services" className="block text-emerald-600 hover:underline">
                  Our Services
                </a>
                <a href="/products" className="block text-emerald-600 hover:underline">
                  Browse Products
                </a>
                <a href="/career" className="block text-emerald-600 hover:underline">
                  Career Opportunities
                </a>
                <a href="/privacy-policy" className="block text-emerald-600 hover:underline">
                  Privacy Policy
                </a>
                <a href="/terms-of-service" className="block text-emerald-600 hover:underline">
                  Terms of Service
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Other Ways to Reach Us</h2>
              <p className="text-muted-foreground mb-6">
                For vendor partnerships, business inquiries, or technical support, please use the contact form above or email us directly at{' '}
                <a href="mailto:kasshit_1@zohomail.in" className="text-emerald-600 hover:underline font-semibold">
                  kasshit_1@zohomail.in
                </a>
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Customer Support</h3>
                  <p className="text-sm text-muted-foreground">
                    For order inquiries, refunds, or product questions
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Vendor Partnership</h3>
                  <p className="text-sm text-muted-foreground">
                    Interested in joining our vendor network?
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Business Inquiries</h3>
                  <p className="text-sm text-muted-foreground">
                    For partnerships, collaborations, or media inquiries
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;

