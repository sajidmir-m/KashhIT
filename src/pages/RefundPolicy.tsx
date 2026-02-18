import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Refund & Cancellation Policy - Kasshit"
        description="Kasshit's refund and cancellation policy. Learn about our return process, refund timelines, and cancellation terms for orders placed on our quick commerce platform."
        keywords="refund policy, cancellation policy, return policy, money back guarantee, quick commerce refund"
        canonical="https://www.kasshit.in/refund-policy"
      />
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <RefreshCw className="h-12 w-12 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold">Refund & Cancellation Policy</CardTitle>
            <p className="text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm sm:text-base">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">1. Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Kasshit, we strive to ensure complete customer satisfaction. This Refund & Cancellation Policy outlines the terms and conditions under which you can cancel orders or request refunds for products purchased through our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">2. Order Cancellation</h2>
              <h3 className="text-lg font-semibold mb-2 text-emerald-800">2.1 Before Dispatch</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You may cancel your order at any time before it is dispatched for delivery. To cancel:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Log in to your account and navigate to "My Orders"</li>
                <li>Select the order you wish to cancel</li>
                <li>Click on "Cancel Order" button</li>
                <li>Alternatively, contact our customer support at kasshit_1@zohomail.in</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                If your order is cancelled before dispatch, you will receive a full refund within 5-7 business days to your original payment method.
              </p>

              <h3 className="text-lg font-semibold mb-2 text-emerald-800 mt-4">2.2 After Dispatch</h3>
              <p className="text-muted-foreground leading-relaxed">
                Once your order has been dispatched, cancellation may not be possible. However, you can return the products as per our Return Policy (Section 3) if they meet the return criteria.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">3. Return Policy</h2>
              <h3 className="text-lg font-semibold mb-2 text-emerald-800">3.1 Eligibility for Returns</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You may return products within 7 days of delivery if:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>The product is damaged, defective, or not as described</li>
                <li>The product is expired or near expiry (for perishable items)</li>
                <li>You received the wrong product</li>
                <li>The product packaging is tampered with</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 text-emerald-800 mt-4">3.2 Non-Returnable Items</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The following items cannot be returned:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Perishable goods (fruits, vegetables, dairy products) unless damaged or expired</li>
                <li>Personal care items that have been opened or used</li>
                <li>Items that are specifically marked as non-returnable</li>
                <li>Customized or personalized products</li>
                <li>Items damaged due to misuse or negligence</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 text-emerald-800 mt-4">3.3 Return Process</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                To initiate a return:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Contact our customer support at kasshit_1@zohomail.in or through your account dashboard</li>
                <li>Provide your order number and reason for return</li>
                <li>Our team will review your request and provide a Return Authorization Number (RAN)</li>
                <li>Pack the items securely in their original packaging (if available)</li>
                <li>Our delivery partner will collect the items from your registered address</li>
                <li>Once we receive and verify the returned items, we will process your refund</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">4. Refund Policy</h2>
              <h3 className="text-lg font-semibold mb-2 text-emerald-800">4.1 Refund Processing</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Refunds will be processed within 5-7 business days after:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Order cancellation (before dispatch)</li>
                <li>Receipt and verification of returned products</li>
                <li>Approval of refund request by our team</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 text-emerald-800 mt-4">4.2 Refund Method</h3>
              <p className="text-muted-foreground leading-relaxed">
                Refunds will be credited to the original payment method used for the purchase:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li><strong>Online Payments:</strong> Refunded to the same credit/debit card or digital wallet</li>
                <li><strong>Cash on Delivery (COD):</strong> Refunded via bank transfer to your registered account</li>
                <li><strong>Store Credit:</strong> In some cases, refunds may be issued as store credit with your consent</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2 text-emerald-800 mt-4">4.3 Partial Refunds</h3>
              <p className="text-muted-foreground leading-relaxed">
                Partial refunds may be issued in cases where:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Only certain items from an order are returned</li>
                <li>Products are returned in used or damaged condition (subject to assessment)</li>
                <li>Return shipping charges are applicable (deducted from refund amount)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">5. Replacement Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                In case of damaged, defective, or wrong products, we offer free replacement (subject to availability) instead of refund, if you prefer. Replacement requests must be made within 7 days of delivery.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our delivery partner will collect the defective/wrong item and deliver the replacement in the same visit, ensuring minimal inconvenience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">6. Delivery Issues</h2>
              <h3 className="text-lg font-semibold mb-2 text-emerald-800">6.1 Failed Deliveries</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                If delivery fails due to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Incorrect or incomplete address provided by you</li>
                <li>Unavailability at the delivery address</li>
                <li>Refusal to accept delivery</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                The order will be cancelled, and a refund will be processed after deducting applicable delivery charges.
              </p>

              <h3 className="text-lg font-semibold mb-2 text-emerald-800 mt-4">6.2 Delayed Deliveries</h3>
              <p className="text-muted-foreground leading-relaxed">
                While we strive for on-time delivery, delays may occur due to unforeseen circumstances. In case of significant delays, you may cancel your order, and we will process a full refund.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">7. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                For any queries regarding cancellations, returns, or refunds, please contact us:
              </p>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> <a href="mailto:kasshit_1@zohomail.in" className="text-emerald-600 hover:underline">kasshit_1@zohomail.in</a>
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>Response Time:</strong> We aim to respond to all queries within 24 hours during business days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">8. Policy Updates</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kasshit reserves the right to modify this Refund & Cancellation Policy at any time. Changes will be effective immediately upon posting on our website. Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;

