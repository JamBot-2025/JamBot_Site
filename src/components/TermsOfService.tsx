import React from 'react';
import { XIcon } from 'lucide-react';
interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
}
export const TermsOfService: React.FC<TermsOfServiceProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-black rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 inset-x-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 animate-gradient-flow blur-xl opacity-70"></div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-10">
          <XIcon size={24} />
        </button>
        <div className="relative p-6 md:p-8 overflow-y-auto max-h-[80vh]">
          <h2 className="text-2xl font-bold text-white mb-6">
            Terms of Service
          </h2>
          <div className="space-y-6 text-white/80">
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                1. Introduction
              </h3>
              <p>
                Welcome to AppName. These Terms of Service govern your use of
                our website and services. By accessing or using our services,
                you agree to be bound by these Terms.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                2. Definitions
              </h3>
              <p>
                <strong>"Service"</strong> refers to the application, website,
                and services provided by AppName.
                <br />
                <strong>"User"</strong> refers to individuals who access or use
                the Service.
                <br />
                <strong>"Subscription"</strong> refers to the paid access to
                premium features of the Service.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                3. Account Registration
              </h3>
              <p>
                To use certain features of the Service, you must register for an
                account. You agree to provide accurate, current, and complete
                information during the registration process and to update such
                information to keep it accurate, current, and complete.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                4. Subscriptions and Payments
              </h3>
              <p>
                4.1 Subscription Plans: We offer various subscription plans with
                different features and pricing. Details of these plans are
                available on our website.
              </p>
              <p>
                4.2 Billing: By subscribing to a paid plan, you authorize us to
                charge your payment method for the subscription fee at the
                then-current rate.
              </p>
              <p>
                4.3 Renewal: Subscriptions automatically renew unless canceled
                at least 24 hours before the end of the current period.
              </p>
              <p>
                4.4 Cancellation: You may cancel your subscription at any time
                through your account settings. Upon cancellation, you will
                continue to have access to the paid features until the end of
                your current billing period.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                5. User Conduct
              </h3>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Distribute malware or other harmful code</li>
                <li>
                  Attempt to gain unauthorized access to any part of the Service
                </li>
                <li>
                  Interfere with or disrupt the integrity or performance of the
                  Service
                </li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                6. Intellectual Property
              </h3>
              <p>
                The Service and its original content, features, and
                functionality are owned by AppName and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                7. Termination
              </h3>
              <p>
                We may terminate or suspend your account and access to the
                Service immediately, without prior notice or liability, for any
                reason, including if you breach these Terms.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                8. Limitation of Liability
              </h3>
              <p>
                In no event shall AppName, its directors, employees, partners,
                agents, suppliers, or affiliates be liable for any indirect,
                incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use,
                goodwill, or other intangible losses.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                9. Changes to Terms
              </h3>
              <p>
                We reserve the right to modify or replace these Terms at any
                time. If a revision is material, we will provide at least 30
                days' notice prior to any new terms taking effect.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                10. Contact Us
              </h3>
              <p>
                If you have any questions about these Terms, please contact us
                at support@appname.com.
              </p>
            </section>
            <div className="pt-4 text-sm text-white/60">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
          <button onClick={onClose} className="mt-8 px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg transition-all hover:opacity-90">
            I Understand
          </button>
        </div>
      </div>
    </div>;
};