import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Pill, FlaskConical, Stethoscope, Activity, Clock, Heart, ShieldCheck, Clipboard, Syringe } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt6 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Navigation */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link to="/receipts" className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Receipts
        </Link>
        <ReceiptControls 
          language={language} 
          onLanguageChange={setLanguage} 
          receiptRef={receiptRef}
          buttonColorClass="bg-slate-800 hover:bg-slate-900"
          disabled={disabled}
          patientId={data.patient.patientId}
          appointmentId={data.appointmentId}
          patientName={data.patient.name}
          patientPhone={data.patient.phone}
        />
      </div>

      {/* Receipt Container */}
      <div ref={receiptRef} className="max-w-5xl mx-auto bg-white shadow-xl rounded-none md:rounded-lg overflow-hidden print:shadow-none">
        {/* Header */}
        <div className={`border-b-4 border-primary ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{data.doctor.hospital}</h1>
                  <p className="text-primary font-semibold mt-1">{data.doctor.specialization} Department</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{data.doctor.address}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-lg">
                  <Clipboard className="w-5 h-5" />
                  PRESCRIPTION
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-slate-500">Rx No: <span className="font-bold text-slate-800">{data.receiptNo}</span></p>
                  <p className="text-sm text-slate-500">Date: <span className="font-medium text-slate-700">{data.date}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className={`grid md:grid-cols-5 gap-0 border-b ${(!isVisible('doctor_info') && !isVisible('patient_info')) ? 'hide-in-pdf' : ''}`}>
          <div className={`md:col-span-2 p-6 border-r bg-slate-50 ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400 mb-3">
              <Stethoscope className="w-4 h-4" />
              Attending Physician
            </div>
            <h3 className="text-xl font-bold text-slate-900">{data.doctor.name}</h3>
            <p className="text-primary font-medium text-sm">{data.doctor.qualification}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-dashed">
                <span className="text-slate-400">Reg. No.</span>
                <span className="font-mono font-medium">{data.doctor.registrationNo}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dashed">
                <span className="text-slate-400">Phone</span>
                <span className="font-medium">{data.doctor.phone}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400">Email</span>
                <span className="font-medium text-xs">{data.doctor.email}</span>
              </div>
            </div>
          </div>
          
          <div className={`md:col-span-3 p-6 ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400 mb-3">
              <Activity className="w-4 h-4" />
              Patient Details
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{data.patient.name}</h3>
                <p className="text-slate-500 text-sm">ID: {data.patient.patientId}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-sm font-bold">
                  {data.patient.bloodGroup}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{data.patient.age}</p>
                <p className="text-xs text-slate-400 uppercase">Years</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{data.patient.gender.charAt(0)}</p>
                <p className="text-xs text-slate-400 uppercase">Gender</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-800">{data.patient.weight}</p>
                <p className="text-xs text-slate-400 uppercase">Weight</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-800">{data.patient.height}</p>
                <p className="text-xs text-slate-400 uppercase">Height</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm"><span className="text-slate-400">Contact:</span> <span className="font-medium">{data.patient.phone}</span></p>
              <p className="text-sm"><span className="text-slate-400">Address:</span> <span className="font-medium">{data.patient.address}</span></p>
            </div>
          </div>
        </div>

        {/* Clinical Section */}
        <div className={`p-6 border-b bg-gradient-to-r from-amber-50/50 via-white to-primary/5 ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis') && !isVisible('medical_history')) ? 'hide-in-pdf' : ''}`}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className={!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">C</span>
                Chief Complaints
              </h3>
              <ul className="space-y-2">
                {data.symptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className={!isVisible('diagnosis') ? 'hide-in-pdf' : ''}>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">D</span>
                Diagnosis
              </h3>
              <ul className="space-y-2">
                {data.diagnosis.map((diag, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm font-medium text-primary">
                    <ShieldCheck className="w-4 h-4" />
                    {diag}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className={!isVisible('medical_history') ? 'hide-in-pdf' : ''}>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">H</span>
                Medical History
              </h3>
              <ul className="space-y-2">
                {data.patientHistory.map((history, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-purple-700">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                    {history}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Lab Tests */}
        <div className={`p-6 border-b ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}>
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
            <FlaskConical className="w-5 h-5 text-indigo-500" />
            Laboratory Investigations
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="text-left p-3 font-semibold text-indigo-900">#</th>
                  <th className="text-left p-3 font-semibold text-indigo-900">Test Name</th>
                  <th className="text-left p-3 font-semibold text-indigo-900">Priority</th>
                  <th className="text-left p-3 font-semibold text-indigo-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.labTests.map((test, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="p-3 font-medium text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-medium">{test.name}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                        test.priority === 'High' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {test.priority}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">Pending</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Medications */}
        <div className={`p-6 border-b ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
              <Syringe className="w-5 h-5 text-blue-500" />
              Rx - Prescribed Medications
            </h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              {data.medications.length} Medications
            </span>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <th className="text-left p-3 font-semibold w-12">#</th>
                  <th className="text-left p-3 font-semibold">Medicine</th>
                  <th className="text-left p-3 font-semibold">Dose</th>
                  <th className="text-left p-3 font-semibold">Frequency</th>
                  <th className="text-left p-3 font-semibold">Duration</th>
                  <th className="text-left p-3 font-semibold">Timing</th>
                </tr>
              </thead>
              <tbody>
                {data.medications.map((med, idx) => (
                  <tr key={idx} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                    <td className="p-3">
                      <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-bold text-slate-800">{med.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{getTranslatedInstructions(med.instructions, language)}</p>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{med.dosage}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3" />
                        {getTranslatedFrequency(med.frequency, language)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 text-xs font-medium">
                        {getTranslatedDuration(med.duration, language)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        {getTranslatedTiming(med.timing, language)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Section */}
        <div className={`p-6 bg-amber-50 border-b ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
          <div className="flex gap-4">
            <div className="w-1 bg-amber-400 rounded-full flex-shrink-0"></div>
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Advice & Special Instructions</h3>
              <p className="text-amber-800 leading-relaxed">{data.notes}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 grid md:grid-cols-2 gap-6 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl">
            <Calendar className="w-10 h-10 text-primary" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Next Appointment</p>
              <p className="text-xl font-bold text-primary">{data.followUpDate}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="inline-block">
              <div className="h-20 flex items-end justify-center border-b-2 border-slate-800 px-16 pb-2">
                <span className="text-2xl italic text-slate-300">Authorized Signature</span>
              </div>
              <div className="pt-2">
                <p className="font-bold text-slate-800">{data.doctor.name}</p>
                <p className="text-sm text-slate-500">{data.doctor.qualification}</p>
                <p className="text-xs text-slate-400">{data.doctor.specialization}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`bg-slate-800 px-6 py-4 flex flex-wrap justify-center gap-6 text-sm text-slate-300 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
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

export default Receipt6;
