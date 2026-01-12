import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Pill, Stethoscope, TestTube, User, Phone, AlertCircle, CheckCircle } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt10 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-fuchsia-50 p-4 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <Link to="/receipts" className="flex items-center gap-2 text-violet-600 hover:underline"><ArrowLeft className="w-4 h-4" />Back to Receipts</Link>
          <ReceiptControls 
            language={language} 
            onLanguageChange={setLanguage} 
            receiptRef={receiptRef} 
            buttonColorClass="bg-violet-600 hover:bg-violet-700" 
            disabled={disabled}
            patientId={data.patient.patientId}
            appointmentId={data.appointmentId}
            patientName={data.patient.name}
            patientPhone={data.patient.phone}
          />
        </div>

        <div ref={receiptRef} className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
          <div className={`relative bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 pt-4 pb-12 ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
            <div className="px-6 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Stethoscope className="w-6 h-6 text-white" /></div>
                <div><h1 className="text-xl font-bold text-white">{data.doctor.hospital}</h1><p className="text-violet-200 text-xs">{data.doctor.address}</p></div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur"><p className="text-violet-200 text-[10px]">Prescription</p><p className="text-white font-bold">{data.receiptNo}</p></div>
            </div>
            <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 30" preserveAspectRatio="none"><path d="M0,30 C300,0 600,30 900,10 C1050,0 1150,20 1200,10 L1200,30 Z" fill="white"/></svg>
          </div>

          <div className={`flex justify-center -mt-6 px-4 relative z-10 ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
            <div className="flex gap-4 bg-white rounded-xl shadow-lg border border-violet-100 px-6 py-3">
              <div className="text-center border-r border-violet-100 pr-4"><p className="text-[10px] text-violet-500 uppercase">Date</p><p className="text-sm font-semibold text-gray-800">{data.date}</p></div>
              <div className="text-center border-r border-violet-100 pr-4"><p className="text-[10px] text-violet-500 uppercase">Patient ID</p><p className="text-sm font-semibold text-gray-800">{data.patient.patientId}</p></div>
              <div className="text-center"><p className="text-[10px] text-violet-500 uppercase">Follow-up</p><p className="text-sm font-semibold text-gray-800">{data.followUpDate}</p></div>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-4 p-4 mt-4 ${(!isVisible('doctor_info') && !isVisible('patient_info')) ? 'hide-in-pdf' : ''}`}>
            <div className={`bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100 ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
              <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center"><Stethoscope className="w-4 h-4 text-violet-600" /></div><span className="text-xs font-bold text-violet-600 uppercase">Physician</span></div>
              <h3 className="font-bold text-gray-800">{data.doctor.name}</h3><p className="text-xs text-gray-500">{data.doctor.qualification}</p><p className="text-xs text-violet-600">{data.doctor.specialization}</p>
            </div>
            <div className={`bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-xl p-4 border border-fuchsia-100 ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
              <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 bg-fuchsia-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-fuchsia-600" /></div><span className="text-xs font-bold text-fuchsia-600 uppercase">Patient</span></div>
              <h3 className="font-bold text-gray-800">{data.patient.name}</h3><p className="text-xs text-gray-500">{data.patient.age}Y • {data.patient.gender} • {data.patient.bloodGroup}</p>
            </div>
          </div>

          <div className={`grid grid-cols-3 gap-3 px-4 ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis') && !isVisible('medical_history')) ? 'hide-in-pdf' : ''}`}>
            <div className={`bg-white rounded-xl border border-violet-100 p-3 shadow-sm ${!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}`}><h4 className="text-[10px] font-bold text-violet-600 uppercase mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Symptoms</h4><div className="space-y-1">{data.symptoms.map((s, i) => <div key={i} className="text-xs text-gray-700 bg-violet-50 px-2 py-1 rounded">{s}</div>)}</div></div>
            <div className={`bg-white rounded-xl border border-purple-100 p-3 shadow-sm ${!isVisible('diagnosis') ? 'hide-in-pdf' : ''}`}><h4 className="text-[10px] font-bold text-purple-600 uppercase mb-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Diagnosis</h4><div className="space-y-1">{data.diagnosis.map((d, i) => <div key={i} className="text-xs text-gray-700 bg-purple-50 px-2 py-1 rounded">{d}</div>)}</div></div>
            <div className={`bg-white rounded-xl border border-fuchsia-100 p-3 shadow-sm ${!isVisible('medical_history') ? 'hide-in-pdf' : ''}`}><h4 className="text-[10px] font-bold text-fuchsia-600 uppercase mb-2">History</h4><div className="space-y-1">{data.patientHistory.map((h, i) => <div key={i} className="text-xs text-gray-700 bg-fuchsia-50 px-2 py-1 rounded">{h}</div>)}</div></div>
          </div>

          <div className={`px-4 mt-4 ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}><div className="bg-gradient-to-r from-violet-100/50 to-fuchsia-100/50 rounded-xl p-3 border border-violet-100"><div className="flex items-center gap-2 mb-2"><TestTube className="w-4 h-4 text-violet-600" /><h4 className="text-xs font-bold text-violet-600 uppercase">Laboratory Tests</h4></div><div className="flex flex-wrap gap-2">{data.labTests.map((t, i) => <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${t.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{t.name}</span>)}</div></div></div>

          <div className={`p-4 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 mb-3"><Pill className="w-5 h-5 text-violet-600" /><h4 className="text-sm font-bold text-violet-600 uppercase">Prescription</h4><span className="text-4xl font-serif text-violet-200 ml-auto">℞</span></div>
            <div className="space-y-2">{data.medications.map((med, i) => (
              <div key={i} className="flex items-center gap-3 bg-gradient-to-r from-violet-50/50 to-fuchsia-50/50 rounded-xl p-3 border border-violet-100">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold text-sm">{i + 1}</div>
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <div className="col-span-2"><p className="font-medium text-gray-800 text-sm">{med.name}</p><p className="text-[10px] text-violet-500">{getTranslatedInstructions(med.instructions, language)}</p></div>
                  <div className="text-center"><p className="text-[10px] text-gray-400">Dose</p><p className="text-xs font-medium text-gray-700">{med.dosage}</p></div>
                  <div className="text-center"><p className="text-[10px] text-gray-400">Timing</p><p className="text-xs font-medium text-gray-700">{getTranslatedTiming(med.timing, language)}</p></div>
                  <div className="text-center"><p className="text-[10px] text-gray-400">Duration</p><p className="text-xs font-medium text-gray-700">{getTranslatedDuration(med.duration, language)}</p></div>
                </div>
              </div>
            ))}</div>
          </div>

          <div className={`px-4 pb-4 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}><div className="bg-violet-50 rounded-xl p-3 border-l-4 border-violet-500"><h4 className="text-xs font-bold text-violet-700 mb-1">Advice & Precautions</h4><p className="text-xs text-gray-600">{data.notes}</p></div></div>
          <div className={`bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4 border-t border-violet-100 flex justify-between items-end ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
            <div className="text-xs text-gray-500"><p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.doctor.phone}</p><p>{data.doctor.email}</p></div>
            <div className="text-center"><div className="w-36 h-10 border-b-2 border-violet-300 mb-1"></div><p className="text-xs text-violet-600">Doctor's Signature</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt10;