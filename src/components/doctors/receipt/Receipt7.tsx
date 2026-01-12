import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Pill, Stethoscope, TestTube, User, Calendar, Phone, MapPin, FileText, Heart, Clock, Mail } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt7 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Controls */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <Link to="/receipts" className="flex items-center gap-2 text-amber-600 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Receipts
          </Link>
          <ReceiptControls 
            language={language} 
            onLanguageChange={setLanguage} 
            receiptRef={receiptRef}
            buttonColorClass="bg-amber-600 hover:bg-amber-700"
            disabled={disabled}
            patientId={data.patient.patientId}
            appointmentId={data.appointmentId}
            patientName={data.patient.name}
            patientPhone={data.patient.phone}
          />
        </div>

        {/* Receipt Container */}
        <div ref={receiptRef} className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
          {/* Header */}
          <div className={`relative h-32 bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 overflow-hidden ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
              <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-white rounded-full"></div>
            </div>
            <div className="relative z-10 h-full flex items-center justify-between px-6">
              <div className="text-white">
                <h1 className="text-2xl font-bold">{data.doctor.hospital}</h1>
                <p className="text-amber-100 text-sm">{data.doctor.address}</p>
              </div>
              <div className="text-right text-white">
                <p className="text-3xl font-bold tracking-wider">Rx</p>
                <p className="text-amber-100 text-xs">{data.receiptNo}</p>
              </div>
            </div>
          </div>

          {/* Doctor & Patient Info */}
          <div className={`grid grid-cols-2 gap-4 p-4 bg-amber-50/50 ${(!isVisible('doctor_info') && !isVisible('patient_info')) ? 'hide-in-pdf' : ''}`}>
            <div className={`bg-white rounded-xl p-4 border border-amber-200 shadow-sm ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Doctor</span>
              </div>
              <h3 className="font-bold text-gray-800">{data.doctor.name}</h3>
              <p className="text-xs text-gray-500">{data.doctor.qualification}</p>
              <p className="text-xs text-gray-500">{data.doctor.specialization}</p>
              <p className="text-xs text-amber-600 mt-1">Reg: {data.doctor.registrationNo}</p>
            </div>
            
            <div className={`bg-white rounded-xl p-4 border border-rose-200 shadow-sm ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-rose-600" />
                </div>
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">Patient</span>
              </div>
              <h3 className="font-bold text-gray-800">{data.patient.name}</h3>
              <div className="flex gap-3 text-xs text-gray-500 mt-1">
                <span>{data.patient.age}Y/{data.patient.gender[0]}</span>
                <span>{data.patient.bloodGroup}</span>
                <span>{data.patient.weight}</span>
              </div>
              <p className="text-xs text-rose-600 mt-1">ID: {data.patient.patientId}</p>
            </div>
          </div>

          {/* Date Bar */}
          <div className={`flex justify-between items-center px-4 py-2 bg-gradient-to-r from-amber-100 to-rose-100 ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Date: <strong>{data.date}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Follow-up: <strong>{data.followUpDate}</strong></span>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 space-y-4">
            {/* Symptoms & Diagnosis */}
            <div className={`grid grid-cols-2 gap-4 ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis')) ? 'hide-in-pdf' : ''}`}>
              <div className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100 ${!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}`}>
                <h4 className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Chief Complaints
                </h4>
                <div className="flex flex-wrap gap-1">
                  {data.symptoms.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white text-amber-700 text-xs rounded-full border border-amber-200">{s}</span>
                  ))}
                </div>
              </div>
              
              <div className={`bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 border border-rose-100 ${!isVisible('diagnosis') ? 'hide-in-pdf' : ''}`}>
                <h4 className="text-xs font-bold text-rose-700 uppercase mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Diagnosis
                </h4>
                <div className="flex flex-wrap gap-1">
                  {data.diagnosis.map((d, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white text-rose-700 text-xs rounded-full border border-rose-200">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* History & Lab Tests */}
            <div className={`grid grid-cols-2 gap-4 ${(!isVisible('medical_history') && !isVisible('lab_tests')) ? 'hide-in-pdf' : ''}`}>
              <div className={`bg-orange-50 rounded-xl p-3 border border-orange-100 ${!isVisible('medical_history') ? 'hide-in-pdf' : ''}`}>
                <h4 className="text-xs font-bold text-orange-700 uppercase mb-2">Medical History</h4>
                <ul className="space-y-1">
                  {data.patientHistory.map((h, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-orange-400 mt-0.5">•</span>{h}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={`bg-rose-50 rounded-xl p-3 border border-rose-100 ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}>
                <h4 className="text-xs font-bold text-rose-700 uppercase mb-2 flex items-center gap-1">
                  <TestTube className="w-3 h-3" /> Lab Investigations
                </h4>
                <div className="space-y-1">
                  {data.labTests.map((t, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">{t.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        t.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Medications */}
            <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
              <div className="bg-gradient-to-r from-amber-600 to-rose-500 px-4 py-2">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4" /> Prescription
                </h4>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 font-semibold text-gray-600">#</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Medicine</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Dosage</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Frequency</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Duration</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.medications.map((med, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                      <td className="p-2 text-amber-600 font-bold">{i + 1}</td>
                      <td className="p-2 font-medium text-gray-800">{med.name}</td>
                      <td className="p-2 text-gray-600">{med.dosage}</td>
                      <td className="p-2 text-gray-600">{getTranslatedFrequency(med.frequency, language)}</td>
                      <td className="p-2 text-gray-600">{getTranslatedDuration(med.duration, language)}</td>
                      <td className="p-2 text-gray-500 italic">{getTranslatedInstructions(med.instructions, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            <div className={`bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-3 border-l-4 border-amber-500 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
              <h4 className="text-xs font-bold text-gray-700 mb-1">Important Instructions</h4>
              <p className="text-xs text-gray-600">{data.notes}</p>
            </div>
          </div>

          {/* Footer */}
          <div className={`border-t border-gray-200 p-4 flex justify-between items-end bg-gray-50 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
            <div className="text-xs text-gray-500">
              <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.doctor.phone}</p>
              <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {data.doctor.email}</p>
            </div>
            <div className="text-right">
              <div className="w-32 border-t-2 border-gray-400 pt-1">
                <p className="text-xs text-gray-600">Doctor's Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt7;

