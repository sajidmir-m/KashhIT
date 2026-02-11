import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold">Terms of Service</CardTitle>
            <p className="text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm sm:text-base">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using KasshIT ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">2. Use of the Service</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Use the Service for any fraudulent or unauthorized purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">3. Account Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features, you may need to create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">4. Products and Orders</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                All products listed on KasshIT are subject to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Availability - Products are subject to stock availability</li>
                <li>Pricing - Prices are subject to change without notice</li>
                <li>Descriptions - We strive for accuracy but cannot guarantee complete accuracy</li>
                <li>Orders - All orders are subject to acceptance and availability</li>
                <li>Payment - Payment must be received before order processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">5. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Payment for orders can be made through various methods including cash on delivery (COD) and online payment gateways. 
                By placing an order, you agree to pay the full amount including applicable taxes and delivery charges. 
                All payments are processed securely through our payment partners.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">6. Shipping and Delivery</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We aim to deliver orders within the estimated delivery timeframes. However:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>We are not responsible for delays caused by shipping carriers</li>
                <li>Risk of loss transfers to you upon delivery</li>
                <li>You must provide accurate delivery addresses</li>
                <li>Additional charges may apply for remote locations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">7. Returns and Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our return and refund policy allows you to return eligible products within the specified time period. 
                Products must be in original condition with tags and packaging. Refunds will be processed according to our refund policy. 
                Please contact customer service for return requests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">8. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on KasshIT, including text, graphics, logos, images, and software, is the property of KasshIT or its content suppliers 
                and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">9. Vendor Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vendors using our platform agree to provide accurate product information, maintain product quality, fulfill orders promptly, 
                and comply with all applicable laws and regulations. We reserve the right to suspend or terminate vendor accounts for violations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, KasshIT shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, 
                use, goodwill, or other intangible losses resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">11. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless KasshIT, its officers, directors, employees, and agents from any claims, damages, 
                losses, liabilities, and expenses arising out of your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">12. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend your account and access to the Service immediately, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms 
                on this page and updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-3 space-y-1 text-muted-foreground">
                <p><strong>Email:</strong> support@kasshit.com</p>
                <p><strong>Phone:</strong> +91 123 456 7890</p>
                <p><strong>Address:</strong> India</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;

