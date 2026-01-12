import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Pill, TestTubes, Stethoscope, User, AlertTriangle, Clock, FileHeart } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt4 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link to="/receipts" className="flex items-center gap-2 text-rose-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Receipts
        </Link>
        <ReceiptControls 
          language={language} 
          onLanguageChange={setLanguage} 
          receiptRef={receiptRef}
          buttonColorClass="bg-rose-600 hover:bg-rose-700"
          disabled={disabled}
          patientId={data.patient.patientId}
          appointmentId={data.appointmentId}
          patientName={data.patient.name}
          patientPhone={data.patient.phone}
        />
      </div>

      {/* Receipt Container */}
      <div ref={receiptRef} className="max-w-4xl mx-auto bg-white shadow-xl rounded-none md:rounded-lg overflow-hidden print:shadow-none">
        <div className="h-2 bg-gradient-to-r from-rose-400 via-amber-400 to-rose-400"></div>

        {/* Header */}
        <div className={!isVisible('header') ? 'hide-in-pdf' : ''}>
          <div className="p-6 md:p-8 border-b-2 border-dashed border-rose-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-4 border-rose-200 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-amber-100">
                  <FileHeart className="w-10 h-10 text-rose-500" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800">{data.doctor.hospital}</h1>
                  <p className="text-rose-600 italic">"Caring for your health, always"</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="inline-block bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
                  <p className="text-xs text-rose-500 uppercase tracking-wider">Prescription</p>
                  <p className="text-xl font-mono font-bold text-slate-700">{data.receiptNo}</p>
                </div>
                <p className="text-slate-500 text-sm mt-2 flex items-center justify-end gap-1">
                  <Calendar className="w-4 h-4" />
                  {data.date}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-3">
          {/* Left Sidebar */}
          <div className="md:col-span-1 bg-gradient-to-b from-rose-50 to-amber-50 p-6 border-r border-rose-100">
            <div className={`mb-6 ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
              <h3 className="text-rose-600 font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
                <Stethoscope className="w-4 h-4" />
                Attending Physician
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-rose-100">
                <h4 className="font-bold text-slate-800">{data.doctor.name}</h4>
                <p className="text-slate-600 text-sm">{data.doctor.qualification}</p>
                <p className="text-rose-500 text-sm mt-1">{data.doctor.specialization}</p>
                <hr className="my-3 border-rose-100" />
                <p className="text-xs text-slate-500">Reg: {data.doctor.registrationNo}</p>
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{data.doctor.phone}</p>
                  <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{data.doctor.email}</p>
                </div>
              </div>
            </div>

            <div className={!isVisible('patient_info') ? 'hide-in-pdf' : ''}>
              <h3 className="text-amber-600 font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-1">
                <User className="w-4 h-4" />
                Patient Details
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
                <h4 className="font-bold text-slate-800">{data.patient.name}</h4>
                <p className="text-slate-600 text-sm">{data.patient.age} yrs, {data.patient.gender}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-amber-50 rounded p-2">
                    <p className="text-amber-500">Blood</p>
                    <p className="font-bold text-slate-700">{data.patient.bloodGroup}</p>
                  </div>
                  <div className="bg-amber-50 rounded p-2">
                    <p className="text-amber-500">ID</p>
                    <p className="font-bold text-slate-700 text-[10px]">{data.patient.patientId}</p>
                  </div>
                  <div className="bg-amber-50 rounded p-2">
                    <p className="text-amber-500">Weight</p>
                    <p className="font-bold text-slate-700">{data.patient.weight}</p>
                  </div>
                  <div className="bg-amber-50 rounded p-2">
                    <p className="text-amber-500">Height</p>
                    <p className="font-bold text-slate-700">{data.patient.height}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">{data.patient.phone}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 p-6">
            {/* Medical History */}
            {data.patientHistory && data.patientHistory.length > 0 && (
              <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 ${!isVisible('medical_history') ? 'hide-in-pdf' : ''}`}>
                <h4 className="font-semibold text-blue-700 text-sm mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Medical History
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.patientHistory.map((history, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white text-blue-700 rounded-full text-xs border border-blue-100 shadow-sm">
                      {history}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={`grid md:grid-cols-2 gap-4 mb-6 ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis')) ? 'hide-in-pdf' : ''}`}>
              <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}`}>
                <h4 className="font-semibold text-orange-700 text-sm mb-2">📋 Symptoms</h4>
                <ul className="text-sm text-slate-700 space-y-1">
                  {data.symptoms.map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${!isVisible('diagnosis') ? 'hide-in-pdf' : ''}`}>
                <h4 className="font-semibold text-green-700 text-sm mb-2">🩺 Diagnosis</h4>
                <ul className="text-sm text-slate-700 space-y-1">
                  {data.diagnosis.map((d, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lab Tests */}
            <div className={`mb-6 ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}>
              <h4 className="font-semibold text-purple-700 text-sm mb-3 flex items-center gap-2">
                <TestTubes className="w-4 h-4" />
                Recommended Tests
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.labTests.map((test, idx) => (
                  <span key={idx} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    test.priority === 'High' 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}>
                    {test.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className={`mb-6 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
              <h4 className="font-semibold text-rose-700 text-sm mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Medications
              </h4>
              <div className="border border-rose-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-rose-50">
                    <tr>
                      <th className="text-left p-3 text-rose-700 font-semibold">Medicine</th>
                      <th className="text-left p-3 text-rose-700 font-semibold hidden md:table-cell">Dose</th>
                      <th className="text-left p-3 text-rose-700 font-semibold">When</th>
                      <th className="text-left p-3 text-rose-700 font-semibold hidden md:table-cell">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.medications.map((med, idx) => (
                      <tr key={idx} className="border-t border-rose-100 hover:bg-rose-50/50">
                        <td className="p-3">
                          <span className="font-medium text-slate-800">{med.name}</span>
                          <span className="md:hidden block text-xs text-slate-500">{med.dosage} • {getTranslatedDuration(med.duration, language)}</span>
                        </td>
                        <td className="p-3 text-slate-600 hidden md:table-cell">{med.dosage}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <Clock className="w-3 h-3" />
                            {getTranslatedTiming(med.timing, language)}
                          </span>
                          <p className="text-xs text-slate-500">{getTranslatedInstructions(med.instructions, language)}</p>
                        </td>
                        <td className="p-3 text-slate-600 hidden md:table-cell">{getTranslatedDuration(med.duration, language)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions */}
            <div className={`bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 mb-6 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
              <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Important Instructions
              </h4>
              <p className="text-slate-700 text-sm">{data.notes}</p>
            </div>

            {/* Footer */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4 border-t border-dashed border-rose-200 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Follow-up Date</p>
                  <p className="font-bold text-slate-800">{data.followUpDate}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-44 border-b-2 border-slate-400 pb-6 mb-1 relative">
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white px-2 text-xs text-slate-400">✍</span>
                </div>
                <p className="font-semibold text-slate-700">{data.doctor.name}</p>
                <p className="text-xs text-slate-500">{data.doctor.qualification}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Contact Bar */}
        <div className={`bg-gradient-to-r from-rose-100 via-amber-100 to-rose-100 px-6 py-4 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-rose-500" />{data.doctor.phone}</span>
            <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-rose-500" />{data.doctor.email}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" />{data.doctor.address}</span>
          </div>
        </div>

        <div className="h-2 bg-gradient-to-r from-rose-400 via-amber-400 to-rose-400"></div>
      </div>
    </div>
  );
};

export default Receipt4;

