import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Calendar, Pill, FlaskRound, Stethoscope, ClipboardList, AlertCircle, CheckCircle2 } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt3 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link to="/receipts" className="flex items-center gap-2 text-sky-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Receipts
        </Link>
        <ReceiptControls 
          language={language} 
          onLanguageChange={setLanguage} 
          receiptRef={receiptRef}
          buttonColorClass="bg-sky-600 hover:bg-sky-700"
          disabled={disabled}
          patientId={data.patient.patientId}
          appointmentId={data.appointmentId}
          patientName={data.patient.name}
          patientPhone={data.patient.phone}
        />
      </div>

      {/* Receipt Container */}
      <div ref={receiptRef} className="max-w-4xl mx-auto bg-slate-800 shadow-2xl rounded-2xl overflow-hidden border border-slate-700 print:bg-white print:border-slate-200">
        {/* Header */}
        <div className={!isVisible('header') ? 'hide-in-pdf' : ''}>
          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[200px] font-serif font-bold text-white/10 leading-none -mt-10 -mr-10">
              ℞
            </div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-white">{data.doctor.hospital}</h1>
                  <p className="text-sky-200 mt-1">{data.doctor.address}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-sky-100">
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{data.doctor.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{data.doctor.email}</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-right">
                  <p className="text-sky-200 text-sm">Prescription No.</p>
                  <p className="text-2xl font-mono font-bold text-white">{data.receiptNo}</p>
                  <p className="text-sky-200 text-sm mt-2">{data.date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Banner */}
        <div className={`bg-slate-750 print:bg-slate-100 px-6 py-4 border-b border-slate-700 print:border-slate-200 flex flex-wrap justify-between items-center gap-4 ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {data.doctor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white print:text-slate-800">{data.doctor.name}</h2>
              <p className="text-slate-400 print:text-slate-600 text-sm">{data.doctor.qualification}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-sky-500/20 print:bg-sky-100 text-sky-400 print:text-sky-700 rounded-full text-sm">
              {data.doctor.specialization}
            </span>
            <p className="text-slate-500 text-xs mt-1">Reg: {data.doctor.registrationNo}</p>
          </div>
        </div>

        {/* Patient Section */}
        <div className={`p-6 border-b border-slate-700 print:border-slate-200 ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
          <h3 className="text-sky-400 print:text-sky-600 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Patient Information
          </h3>
          <div className="bg-slate-700/50 print:bg-slate-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-500 text-xs">Full Name</p>
              <p className="text-white print:text-slate-800 font-medium">{data.patient.name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Age / Gender</p>
              <p className="text-white print:text-slate-800 font-medium">{data.patient.age} yrs • {data.patient.gender}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Blood Group</p>
              <p className="text-white print:text-slate-800 font-medium">{data.patient.bloodGroup}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Patient ID</p>
              <p className="text-white print:text-slate-800 font-medium font-mono">{data.patient.patientId}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Contact</p>
              <p className="text-white print:text-slate-800 font-medium">{data.patient.phone}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Weight</p>
              <p className="text-white print:text-slate-800 font-medium">{data.patient.weight}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Height</p>
              <p className="text-white print:text-slate-800 font-medium">{data.patient.height}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Address</p>
              <p className="text-white print:text-slate-800 font-medium text-sm">{data.patient.address}</p>
            </div>
          </div>
        </div>

        {/* Clinical Assessment */}
        <div className={`p-6 border-b border-slate-700 print:border-slate-200 grid md:grid-cols-2 gap-6 ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis') && !isVisible('medical_history')) ? 'hide-in-pdf' : ''}`}>
          <div className={!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}>
            <h3 className="text-orange-400 print:text-orange-600 font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Chief Complaints
            </h3>
            <ul className="space-y-2">
              {data.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-center gap-2 text-slate-300 print:text-slate-700">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  {symptom}
                </li>
              ))}
            </ul>
          </div>
          <div className={(!isVisible('diagnosis') && !isVisible('medical_history')) ? 'hide-in-pdf' : ''}>
            <div className={!isVisible('diagnosis') ? 'hide-in-pdf' : ''}>
              <h3 className="text-emerald-400 print:text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Diagnosis
              </h3>
              <ul className="space-y-2">
                {data.diagnosis.map((diag, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300 print:text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {diag}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`mt-6 ${!isVisible('medical_history') ? 'hide-in-pdf' : ''}`}>
              <h3 className="text-indigo-400 print:text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Medical History
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.patientHistory.map((h, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-700 print:bg-slate-100 text-indigo-300 print:text-indigo-700 border border-slate-600 print:border-indigo-200 rounded text-xs">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lab Tests */}
        <div className={`p-6 border-b border-slate-700 print:border-slate-200 ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}>
          <h3 className="text-purple-400 print:text-purple-600 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <FlaskRound className="w-4 h-4" />
            Laboratory Investigations
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.labTests.map((test, idx) => (
              <div key={idx} className={`px-4 py-2 rounded-lg border ${
                test.priority === 'High' 
                  ? 'bg-red-500/20 border-red-500/50 text-red-300 print:bg-red-50 print:text-red-700 print:border-red-200' 
                  : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300 print:bg-yellow-50 print:text-yellow-700 print:border-yellow-200'
              }`}>
                <span className="font-medium">{test.name}</span>
                <span className="ml-2 text-xs opacity-75">({test.priority})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prescription */}
        <div className={`p-6 border-b border-slate-700 print:border-slate-200 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
          <h3 className="text-sky-400 print:text-sky-600 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <Pill className="w-4 h-4" />
            Prescription
          </h3>
          <div className="space-y-3">
            {data.medications.map((med, idx) => (
              <div key={idx} className="bg-gradient-to-r from-slate-700/50 to-slate-700/30 print:from-slate-50 print:to-slate-100 rounded-xl p-4 border border-slate-600 print:border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white print:text-slate-800">{med.name}</h4>
                      <p className="text-slate-400 print:text-slate-600 text-sm">
                        {med.dosage} | {getTranslatedFrequency(med.frequency, language)} | {getTranslatedDuration(med.duration, language)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:text-right text-sm">
                    <span className="px-2 py-1 bg-indigo-500/20 print:bg-indigo-100 text-indigo-300 print:text-indigo-700 rounded">
                      ⏰ {getTranslatedTiming(med.timing, language)}
                    </span>
                    <span className="px-2 py-1 bg-slate-600 print:bg-slate-200 text-slate-300 print:text-slate-600 rounded">
                      💊 {getTranslatedInstructions(med.instructions, language)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-6 border-b border-slate-700 print:border-slate-200 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
          <div className="bg-amber-500/10 print:bg-amber-50 border border-amber-500/30 print:border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold text-amber-400 print:text-amber-700 mb-2">⚠️ Special Instructions</h3>
            <p className="text-slate-300 print:text-slate-700 text-sm leading-relaxed">{data.notes}</p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-750 print:bg-slate-50 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-500/20 print:bg-sky-100 rounded-xl">
              <Calendar className="w-6 h-6 text-sky-400 print:text-sky-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Next Appointment</p>
              <p className="text-xl font-bold text-white print:text-slate-800">{data.followUpDate}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-48 border-b-2 border-dashed border-slate-500 pb-2 mb-2">
              <p className="font-bold text-white print:text-slate-800">{data.doctor.name}</p>
            </div>
            <p className="text-slate-500 text-xs">Doctor's Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt3;

