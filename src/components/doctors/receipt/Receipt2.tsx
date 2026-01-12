import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone, Calendar, Clock, Activity, TestTube, Tablets, Heart } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt2 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link to="/receipts" className="flex items-center gap-2 text-emerald-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Receipts
        </Link>
        <ReceiptControls 
          language={language} 
          onLanguageChange={setLanguage} 
          receiptRef={receiptRef}
          buttonColorClass="bg-emerald-600 hover:bg-emerald-700"
          disabled={disabled}
          patientId={data.patient.patientId}
          appointmentId={data.appointmentId}
          patientName={data.patient.name}
          patientPhone={data.patient.phone}
        />
      </div>

      {/* Receipt Container */}
      <div ref={receiptRef} className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-emerald-100 print:shadow-none print:rounded-none print:border-none">
        {/* Header */}
        <div className={!isVisible('header') ? 'hide-in-pdf' : ''}>
          <div className="relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-emerald-500 to-teal-600 opacity-10 rounded-bl-[100px]"></div>
            <div className="p-8 relative">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">{data.doctor.hospital}</h1>
                    <p className="text-emerald-600 font-medium">{data.doctor.specialization}</p>
                    <p className="text-slate-500 text-sm mt-1">{data.doctor.address}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl text-right">
                  <p className="text-emerald-100 text-xs uppercase tracking-wider">Prescription</p>
                  <p className="text-xl font-bold">{data.receiptNo}</p>
                  <p className="text-emerald-100 text-sm flex items-center justify-end gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {data.date}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor & Patient Cards */}
        <div className={`px-8 pb-6 grid md:grid-cols-2 gap-4 ${(!isVisible('doctor_info') && !isVisible('patient_info')) ? 'hide-in-pdf' : ''}`}>
            <div className={`bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200 ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
              <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mb-2">Consulting Doctor</p>
              <h3 className="text-lg font-bold text-slate-800">{data.doctor.name}</h3>
              <p className="text-slate-600 text-sm">{data.doctor.qualification}</p>
              <p className="text-slate-500 text-sm mt-2">Reg: {data.doctor.registrationNo}</p>
              <div className="mt-3 flex gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{data.doctor.phone}</span>
              </div>
            </div>
            <div className={`bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
              <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mb-2">Patient Details</p>
              <h3 className="text-lg font-bold text-slate-800">{data.patient.name}</h3>
              <p className="text-slate-600 text-sm">{data.patient.age} years, {data.patient.gender} • {data.patient.bloodGroup}</p>
              <p className="text-slate-500 text-sm">ID: {data.patient.patientId}</p>
              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span>Wt: {data.patient.weight}</span>
                <span>Ht: {data.patient.height}</span>
              </div>
            </div>
        </div>

        {/* Medical History */}
        {data.patientHistory && data.patientHistory.length > 0 && (
          <div className={`px-8 pb-6 ${!isVisible('medical_history') ? 'hide-in-pdf' : ''}`}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Activity className="w-4 h-4 text-emerald-500" />
                Medical History
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.patientHistory.map((history, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-xl text-sm border border-slate-200">
                    {history}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clinical Findings */}
        <div className={`px-8 pb-6 ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis')) ? 'hide-in-pdf' : ''}`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="grid md:grid-cols-2 gap-6">
                <div className={!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Activity className="w-4 h-4 text-orange-500" />
                    Presenting Symptoms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.symptoms.map((symptom, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-xl text-sm border border-orange-200">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={!isVisible('diagnosis') ? 'hide-in-pdf' : ''}>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Heart className="w-4 h-4 text-emerald-500" />
                    Clinical Diagnosis
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.diagnosis.map((diag, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-200 font-medium">
                        {diag}
                      </span>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Lab Investigations */}
        <div className={`px-8 pb-6 ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <TestTube className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-slate-800">Laboratory Investigations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.labTests.map((test, idx) => (
                <div key={idx} className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${test.priority === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{test.name}</p>
                    <p className="text-xs text-purple-600">{test.priority} Priority</p>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Medications */}
        <div className={`px-8 pb-6 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <Tablets className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-slate-800">Medications</h2>
            </div>
            <div className="grid gap-3">
              {data.medications.map((med, idx) => (
                <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{med.name}</h4>
                        <p className="text-sm text-slate-500">{med.dosage} • {getTranslatedFrequency(med.frequency, language)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-white border border-blue-200 rounded-lg text-blue-700">
                        <Clock className="w-3 h-3 inline mr-1" />{getTranslatedTiming(med.timing, language)}
                      </span>
                      <span className="px-2 py-1 bg-white border border-blue-200 rounded-lg text-slate-600">
                        {getTranslatedDuration(med.duration, language)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 pl-13 md:pl-[52px]">📝 {getTranslatedInstructions(med.instructions, language)}</p>
                </div>
              ))}
            </div>
        </div>

        {/* Advice Box */}
        <div className={`px-8 pb-6 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
              <h3 className="font-semibold text-amber-800 mb-1">Advice & Instructions</h3>
              <p className="text-sm text-amber-900">{data.notes}</p>
            </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-6 bg-slate-50 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Follow-up Date</p>
                <p className="font-bold text-emerald-600">{data.followUpDate}</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="inline-block border-b-2 border-slate-400 pb-1 px-8 mb-1">
                <p className="font-bold text-slate-700">{data.doctor.name}</p>
              </div>
              <p className="text-xs text-slate-500">Authorized Signature</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt2;