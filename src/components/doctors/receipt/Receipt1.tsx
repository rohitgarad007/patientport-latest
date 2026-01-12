import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, User, Pill, FlaskConical, Stethoscope, FileText } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt1 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link to="/receipts" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Receipts
        </Link>
        <ReceiptControls 
          language={language} 
          onLanguageChange={setLanguage} 
          receiptRef={receiptRef}
          disabled={disabled}
          patientId={data.patient.patientId}
          appointmentId={data.appointmentId}
          patientName={data.patient.name}
          patientPhone={data.patient.phone}
        />
      </div>

      {/* Receipt Container */}
      <div ref={receiptRef} className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r from-primary to-primary/80 text-white p-6 md:p-8 ${(!isVisible('header') && !isVisible('doctor_info')) ? 'hide-in-pdf' : ''}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className={!isVisible('header') ? 'hide-in-pdf' : ''}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{data.doctor.hospital}</h1>
                  <p className="text-white/80 text-sm">{data.doctor.address}</p>
                </div>
              </div>
            </div>
            <div className={`text-right ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
              <p className="text-lg font-semibold">{data.doctor.name}</p>
              <p className="text-white/80 text-sm">{data.doctor.qualification}</p>
              <p className="text-white/80 text-sm">Reg. No: {data.doctor.registrationNo}</p>
            </div>
          </div>
        </div>

        {/* Receipt Number & Date Bar */}
        <div className={`bg-primary/10 px-6 py-3 flex flex-wrap justify-between items-center text-sm ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
          <span className="font-semibold text-primary">Receipt No: {data.receiptNo}</span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {data.date}
          </span>
        </div>

        {/* Patient Information */}
        <div className={`p-6 border-b ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{data.patient.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Age / Gender</p>
              <p className="font-medium">{data.patient.age} yrs / {data.patient.gender}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Patient ID</p>
              <p className="font-medium">{data.patient.patientId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Blood Group</p>
              <p className="font-medium">{data.patient.bloodGroup}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{data.patient.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Weight / Height</p>
              <p className="font-medium">{data.patient.weight} / {data.patient.height}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium">{data.patient.address}</p>
            </div>
          </div>
        </div>

        {/* Patient Medical History */}
        {data.patientHistory && data.patientHistory.length > 0 && (
          <div className={`p-6 border-b ${!isVisible('medical_history') ? 'hide-in-pdf' : ''}`}>
            <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Medical History
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.patientHistory.map((history, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm border border-slate-200">
                  {history}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Symptoms & Diagnosis */}
        <div className={`p-6 border-b grid md:grid-cols-2 gap-6 ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis')) ? 'hide-in-pdf' : ''}`}>
          <div className={!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}>
            <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Chief Complaints
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.symptoms.map((symptom, idx) => (
                <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                  {symptom}
                </span>
              ))}
            </div>
          </div>
          <div className={!isVisible('diagnosis') ? 'hide-in-pdf' : ''}>
            <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Diagnosis
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.diagnosis.map((diag, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {diag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Lab Tests */}
        <div className={`p-6 border-b ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}>
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            Recommended Lab Tests
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {data.labTests.map((test, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-medium text-sm">{test.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                  test.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {test.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Medications Table */}
        <div className={`p-6 border-b ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Prescribed Medications
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5">
                  <th className="text-left p-3 font-semibold">#</th>
                  <th className="text-left p-3 font-semibold">Medicine</th>
                  <th className="text-left p-3 font-semibold">Dosage</th>
                  <th className="text-left p-3 font-semibold">Frequency</th>
                  <th className="text-left p-3 font-semibold">Duration</th>
                  <th className="text-left p-3 font-semibold">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {data.medications.map((med, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium">{idx + 1}</td>
                    <td className="p-3 font-medium text-primary">{med.name}</td>
                    <td className="p-3">{med.dosage}</td>
                    <td className="p-3">{getTranslatedFrequency(med.frequency, language)}</td>
                    <td className="p-3">{getTranslatedDuration(med.duration, language)}</td>
                    <td className="p-3 text-muted-foreground">{getTranslatedInstructions(med.instructions, language)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Follow-up */}
        <div className={!isVisible('footer') ? 'hide-in-pdf' : ''}>
          <div className="p-6 bg-amber-50 border-b">
            <h2 className="text-lg font-semibold text-amber-800 mb-2">Special Instructions</h2>
            <p className="text-amber-900 text-sm">{data.notes}</p>
          </div>

          {/* Footer */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Follow-up Date</p>
              <p className="font-semibold text-primary">{data.followUpDate}</p>
            </div>
            <div className="text-right">
              <div className="border-t-2 border-primary pt-2 px-8">
                <p className="text-sm font-semibold">Doctor's Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="bg-slate-100 px-6 py-4 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {data.doctor.phone}
          </span>
          <span className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {data.doctor.email}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {data.doctor.address}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Receipt1;