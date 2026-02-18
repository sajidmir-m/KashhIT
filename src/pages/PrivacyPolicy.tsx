import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold">Privacy Policy</CardTitle>
            <p className="text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm sm:text-base">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Kassh.IT ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Name, email address, phone number, and postal address</li>
                <li>Account credentials and profile information</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Order history and transaction details</li>
                <li>Customer service communications</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                We also automatically collect certain information when you visit our website, such as IP address, browser type, device information, 
                and usage patterns through cookies and similar technologies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Process and fulfill your orders</li>
                <li>Provide customer service and support</li>
                <li>Send you order confirmations, updates, and shipping notifications</li>
                <li>Improve our website, products, and services</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">4. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your information only with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Service providers who assist in operating our business (payment processors, shipping companies, etc.)</li>
                <li>Vendors who fulfill your orders</li>
                <li>Delivery partners for order delivery</li>
                <li>Legal authorities when required by law or to protect our rights</li>
                <li>Business partners in case of merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">7. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. 
                You can control cookies through your browser settings. For more information, please see our Cookie Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">8. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. 
                If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">9. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
                and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-3 space-y-1 text-muted-foreground">
                <p><strong>Email:</strong> kasshit_1@zohomail.in</p>
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

export default PrivacyPolicy;

