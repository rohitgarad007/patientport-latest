import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
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
            <CardTitle className="text-3xl font-bold text-gray-900">Terms of Service</CardTitle>
           
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[800px] w-full p-6 sm:p-10">
              <div className="space-y-8 text-gray-700 leading-relaxed">
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to UMA Hospital</h2>
                  <p className="mb-4">
                    (“Hospital,” “we,” “us,” or “our”). These Terms of Service (“Terms”) govern your access to and use of the website <a href="https://umahospital.obwebsite.in/" className="text-primary hover:underline">https://umahospital.obwebsite.in/</a> and any related online services, hospital management systems, patient portals, appointment booking tools, and digital healthcare services (collectively, the “Services”).
                  </p>
                  <p>
                    By accessing or using our Services, you acknowledge that you have read, understood, and agreed to be bound by these Terms.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
                  <p>
                    By using our website or Services, you agree to comply with these Terms and all applicable laws and regulations of India. If you do not agree with any part of these Terms, you must not use our Services.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Nature of Services</h3>
                  <p className="mb-3">UMA Hospital provides:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Medical consultation and treatment services</li>
                    <li>Appointment scheduling and patient registration</li>
                    <li>Access to medical records, reports, and billing information</li>
                    <li>Health-related information for general awareness</li>
                  </ul>
                  <p className="mt-2 text-sm italic bg-yellow-50 p-2 rounded border border-yellow-100">
                    Important: Information available on the website is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. User Eligibility</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>You must be at least 18 years of age to use our Services independently.</li>
                    <li>For minors, use of Services must be done by a parent or legal guardian, who accepts responsibility under these Terms.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. User Responsibilities</h3>
                  <p className="mb-3">By using our Services, you agree that you will:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Provide accurate and complete information</li>
                    <li>Use the Services only for lawful and legitimate purposes</li>
                    <li>Not misuse, interfere with, or disrupt the website or hospital systems</li>
                    <li>Maintain confidentiality of your login credentials, if any</li>
                  </ul>
                  <p>
                    You are solely responsible for any activity performed using your account.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Appointments & Medical Services</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Appointment availability depends on doctor schedules and hospital resources</li>
                    <li>Appointment confirmation does not guarantee treatment outcome</li>
                    <li>The Hospital reserves the right to reschedule or cancel appointments due to emergencies or unavoidable circumstances</li>
                    <li>Medical decisions are made solely by qualified healthcare professionals based on clinical judgment.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Payments & Billing</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Fees for consultations, diagnostics, treatments, and other services are subject to change</li>
                    <li>Payments may be required before or after services, depending on hospital policy</li>
                    <li>Insurance claims are subject to insurer approval and hospital documentation requirements</li>
                    <li>UMA Hospital is not responsible for delays or denials by insurance providers.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Privacy & Data Protection</h3>
                  <p className="mb-3">
                    Your use of the Services is also governed by our Privacy Policy, which explains how personal and medical data is collected, stored, and protected.
                  </p>
                  <p>
                    By using our Services, you consent to the collection and processing of your information as described in the Privacy Policy.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Intellectual Property Rights</h3>
                  <p className="mb-3">
                    All content on this website, including text, images, logos, graphics, and software, is the property of UMA Hospital or its licensors and is protected under applicable intellectual property laws.
                  </p>
                  <p>
                    You may not copy, reproduce, distribute, or modify any content without prior written permission.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Prohibited Activities</h3>
                  <p className="mb-3">You agree not to:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Upload false, misleading, or harmful information</li>
                    <li>Attempt unauthorized access to systems or data</li>
                    <li>Introduce malware, viruses, or malicious code</li>
                    <li>Violate patient confidentiality or hospital security policies</li>
                  </ul>
                  <p>
                    Violation of these terms may result in suspension or termination of access.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Limitation of Liability</h3>
                  <p className="mb-3">To the fullest extent permitted by law, UMA Hospital shall not be liable for:</p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Any indirect, incidental, or consequential damages</li>
                    <li>Loss arising from reliance on website information</li>
                    <li>Technical errors, interruptions, or data loss</li>
                    <li>Medical outcomes depend on individual conditions and are not guaranteed.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Indemnification</h3>
                  <p className="mb-3">
                    You agree to indemnify and hold harmless UMA Hospital, its staff, doctors, and management from any claims, losses, or damages arising from:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Your misuse of Services</li>
                    <li>Violation of these Terms</li>
                    <li>Providing incorrect or misleading information</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">12. Third-Party Links</h3>
                  <p>
                    The website may contain links to third-party websites for convenience. UMA Hospital does not control or endorse these websites and is not responsible for their content or practices.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">13. Termination of Access</h3>
                  <p>
                    UMA Hospital reserves the right to suspend or terminate access to Services at any time, without prior notice, if these Terms are violated or for operational or legal reasons.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">14. Governing Law & Jurisdiction</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>These Terms shall be governed by and interpreted in accordance with the laws of India.</li>
                    <li>Any disputes shall be subject to the exclusive jurisdiction of courts located in [Your City / State].</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">15. Changes to Terms</h3>
                  <p>
                    We may update these Terms from time to time. Continued use of the Services after changes are posted constitutes acceptance of the revised Terms.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">16. Contact Information</h3>
                  <p className="mb-2">For any questions or concerns regarding these Terms:</p>
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

export default TermsOfService;
