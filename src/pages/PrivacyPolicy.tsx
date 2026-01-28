import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-transparent hover:text-primary p-0 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="text-center border-b bg-white/50 pb-8 pt-10">
            <CardTitle className="text-3xl font-bold text-gray-900">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[800px] w-full p-6 sm:p-10">
              <div className="space-y-8 text-gray-700 leading-relaxed">
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy Policy for UMA Hospital</h2>
                  <p className="mb-4">
                    <a href="https://umahospital.obwebsite.in/" className="text-primary hover:underline">https://umahospital.obwebsite.in/</a> (“we,” “us,” or “our”) operates the UMA Hospital website and Hospital Management System to provide healthcare services, patient support, appointment scheduling, digital records access and related services (collectively, the “Services”).
                  </p>
                  <p className="mb-4">
                    Your privacy and the protection of your personal information are very important to us. This Privacy Policy explains how we collect, use, disclose, secure, and retain personal and sensitive health information in connection with your use of our website and services.
                  </p>
                  <p>
                    By visiting or using our Services, you agree to the terms of this Privacy Policy.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
                  
                  <div className="ml-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">1.1 Personal Identifiable Information (PII)</h4>
                    <p className="mb-2">We may collect information that can identify you directly, including but not limited to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Full name, postal address, email address, telephone/mobile number</li>
                      <li>Date of birth, gender</li>
                      <li>Identification numbers required for medical records or billing (e.g., Unique Health ID, insurance number)</li>
                    </ul>
                  </div>

                  <div className="ml-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">1.2 Sensitive Personal and Health Information</h4>
                    <p className="mb-2">We may collect medical, clinical and related personal data necessary for providing healthcare services, including:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Medical history, diagnoses, treatment records, prescriptions</li>
                      <li>Laboratory results, imaging reports, clinical notes</li>
                      <li>Insurance and billing information</li>
                      <li>Emergency contact details</li>
                    </ul>
                    <p className="mt-2 text-sm italic bg-yellow-50 p-2 rounded border border-yellow-100">
                      Note: Medical/health information is considered sensitive personal data and is treated with heightened confidentiality and protection.
                    </p>
                  </div>

                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 mb-2">1.3 Technical & Website Usage Information</h4>
                    <p className="mb-2">We may automatically collect:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>IP addresses, device characteristics, browser type</li>
                      <li>Usage data (pages visited, time spent, clicks)</li>
                      <li>Cookies and similar technologies to improve our website performance and user experience</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
                  <p className="mb-3">We process your information for the following purposes:</p>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li>Providing and managing healthcare services; patient care and treatment coordination</li>
                    <li>Processing appointments, registrations, bills, and insurance claims</li>
                    <li>Communication regarding appointments, health results, reminders</li>
                    <li>Improving and personalizing Services</li>
                    <li>Compliance with legal and regulatory requirements</li>
                  </ul>
                  <p>
                    We use sensitive health data only to the extent required for providing healthcare and related administrative services, as allowed by applicable law.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Legal Basis & Consent</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>We collect and process your personal information only with your consent or as required to fulfill the services you request.</li>
                    <li>When sensitive health information is collected, explicit consent is obtained at the point of collection or through clearly stated consent mechanisms.</li>
                    <li>You may withdraw consent at any time, subject to legal or contractual requirements.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Third-Party Disclosure</h3>
                  <p className="mb-3">We may share data with:</p>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li>Healthcare professionals and providers involved in your care</li>
                    <li>Insurance companies for billing and claim processing</li>
                    <li>Authorized service partners for technical support, analytics, or operational needs</li>
                  </ul>
                  <p>
                    Your information is not sold or rented to third parties. Any third party that receives your data must keep it confidential and secure.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Cookies & Tracking Technologies</h3>
                  <p className="mb-3">Our website may use cookies and similar technologies to:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Recognize repeat visitors</li>
                    <li>Track user preferences and improve website performance</li>
                  </ul>
                  <p>
                    You can manage cookie preferences through your browser settings; however, disabling cookies may affect certain features.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Data Security & Protection</h3>
                  <p className="mb-2">
                    UMA Hospital uses reasonable technical, administrative, and organisational safeguards to protect your personal data from unauthorized access, misuse, alteration, or destruction. Security measures include encryption, access controls, monitoring, and secure storage systems.
                  </p>
                  <p>
                    We regularly review our privacy and security practices to ensure data protection.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Data Retention</h3>
                  <p className="mb-3">We retain your information only as long as necessary to:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Provide healthcare and related services</li>
                    <li>Comply with applicable medical record-keeping requirements</li>
                    <li>Fulfill legal and regulatory obligations</li>
                  </ul>
                  <p>
                    After that, data is securely deleted or anonymized.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Your Rights</h3>
                  <p className="mb-3">You have the right to:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Access your personal data records</li>
                    <li>Request correction of inaccurate information</li>
                    <li>Request deletion or restriction of processing in accordance with Indian law</li>
                    <li>Withdraw consent where processing is based on consent</li>
                  </ul>
                  <p>
                    To exercise your rights, contact us using the contact details below.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Children’s Privacy</h3>
                  <p>
                    We do not knowingly collect personal information from children under the age of 18 without parental or guardian consent. If we learn that such information has been collected without appropriate consent, we will delete it.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Links to Other Websites</h3>
                  <p>
                    Our Services may link to external sites operated by third parties. We are not responsible for their privacy practices, and this policy does not apply to external websites.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Updates to This Privacy Policy</h3>
                  <p>
                    We may modify this Privacy Policy from time to time to reflect changes in legal requirements, technology, or Services. The updated version will be posted on our website with a “Last Updated” date.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">12. Contact Information</h3>
                  <p className="mb-2">If you have questions, complaints, or requests regarding this Privacy Policy or your personal data:</p>
                  <div className="bg-gray-100 p-4 rounded-md inline-block">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Email:</span> 
                      <a href="mailto:info@obwebsite.in" className="text-primary hover:underline">info@obwebsite.in</a>
                    </p>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
