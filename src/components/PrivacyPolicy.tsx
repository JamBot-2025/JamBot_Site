import React, { Children } from 'react';
import { XIcon } from 'lucide-react';
interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}
export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
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
          <h2 className="text-2xl font-bold text-white mb-6">Privacy Policy</h2>
          <div className="space-y-6 text-white/80">
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                1. Introduction
              </h3>
              <p>
                At AppName, we take your privacy seriously. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you use our service.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                2. Information We Collect
              </h3>
              <p>
                <strong>Personal Information:</strong> When you register for an
                account, we collect your name, email address, and payment
                information.
              </p>
              <p>
                <strong>Usage Data:</strong> We automatically collect
                information about how you interact with our service, including
                the pages you visit, the time and date of your visits, and the
                features you use.
              </p>
              <p>
                <strong>Device Information:</strong> We collect information
                about the device you use to access our service, including the
                hardware model, operating system, and browser type.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                3. How We Use Your Information
              </h3>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>
                  Send you technical notices, updates, security alerts, and
                  support messages
                </li>
                <li>
                  Respond to your comments, questions, and customer service
                  requests
                </li>
                <li>
                  Monitor and analyze trends, usage, and activities in
                  connection with our service
                </li>
                <li>
                  Personalize your experience and deliver content relevant to
                  your interests
                </li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                4. How We Share Your Information
              </h3>
              <p>We may share your information in the following situations:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  With service providers who perform services on our behalf
                </li>
                <li>To comply with legal obligations</li>
                <li>To protect and defend our rights and property</li>
                <li>With business partners with your consent</li>
                <li>In connection with a merger, sale, or acquisition</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                5. Cookies and Tracking Technologies
              </h3>
              <p>
                We use cookies and similar tracking technologies to track
                activity on our service and hold certain information. You can
                instruct your browser to refuse all cookies or to indicate when
                a cookie is being sent.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                6. Data Security
              </h3>
              <p>
                We have implemented appropriate technical and organizational
                security measures designed to protect the security of any
                personal information we process. However, please note that no
                electronic transmission or storage of information can be
                entirely secure.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                7. Your Data Protection Rights
              </h3>
              <p>
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  The right to access personal information we hold about you
                </li>
                <li>
                  The right to request correction of inaccurate personal
                  information
                </li>
                <li>
                  The right to request deletion of your personal information
                </li>
                <li>
                  The right to object to processing of your personal information
                </li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                8. Children's Privacy
              </h3>
              <p>
                Our service is not intended for individuals under the age of 13.
                We do not knowingly collect personal information from children
                under 13.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                9. Changes to This Privacy Policy
              </h3>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-medium text-white mb-2">
                10. Contact Us
              </h3>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at privacy@appname.com.
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