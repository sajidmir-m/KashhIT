import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie } from 'lucide-react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <Cookie className="h-12 w-12 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold">Cookie Policy</CardTitle>
            <p className="text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm sm:text-base">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">1. What Are Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work 
                more efficiently and provide information to website owners. Cookies allow websites to remember your actions and preferences over 
                a period of time, so you don't have to keep re-entering them whenever you come back to the site or browse from one page to another.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">2. How We Use Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                KasshIT uses cookies for various purposes to enhance your experience on our website:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings to provide a personalized experience</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website to improve performance</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">3. Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-emerald-800">Essential Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies are necessary for the website to function and cannot be switched off. They include authentication cookies 
                    that keep you logged in and security cookies that protect against fraudulent activity.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 text-emerald-800">Performance Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. 
                    This helps us improve the website's functionality and user experience.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 text-emerald-800">Functionality Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies allow the website to remember choices you make (such as language, region, or user preferences) and provide 
                    enhanced, personalized features.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 text-emerald-800">Targeting/Advertising Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies may be set through our site by advertising partners. They may be used to build a profile of your interests 
                    and show you relevant content on other sites.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                In addition to our own cookies, we may use various third-party cookies to report usage statistics and deliver advertisements. 
                These may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Google Analytics for website analytics</li>
                <li>Payment processors for secure transactions</li>
                <li>Social media platforms for sharing features</li>
                <li>Advertising networks for targeted advertisements</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                These third parties may use cookies to collect information about your online activities across different websites. 
                We do not control these cookies, so please check the third-party websites for more information about their cookie policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">5. Managing Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify 
                your browser settings to decline cookies if you prefer. However, this may prevent you from taking full advantage of the website.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                To manage cookies, you can:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Adjust your browser settings to block or delete cookies</li>
                <li>Use browser extensions that manage cookies</li>
                <li>Clear cookies from your browser settings</li>
                <li>Use our cookie preference center (if available)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">6. Browser-Specific Instructions</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</p>
                <p><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</p>
                <p><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</p>
                <p><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">7. Do Not Track Signals</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit that you do not want to have your 
                online activity tracked. Currently, there is no standard for how DNT signals should be interpreted. We do not currently 
                respond to DNT signals.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">8. Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. 
                We will notify you of any material changes by posting the updated Cookie Policy on this page and updating the "Last Updated" date. 
                We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-emerald-900">9. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
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

export default CookiePolicy;

