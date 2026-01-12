import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Pill, Stethoscope, TestTube, User, Heart, Activity, FileText, Clipboard } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt11 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-indigo-50 p-4 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <Link to="/receipts" className="flex items-center gap-2 text-cyan-600 hover:underline"><ArrowLeft className="w-4 h-4" />Back to Receipts</Link>
          <ReceiptControls 
            language={language} 
            onLanguageChange={setLanguage} 
            receiptRef={receiptRef} 
            buttonColorClass="bg-cyan-600 hover:bg-cyan-700" 
            disabled={disabled}
          patientId={data.patient.patientId}
          appointmentId={data.appointmentId}
          patientName={data.patient.name}
          patientPhone={data.patient.phone}
        />
        </div>

        <div ref={receiptRef} className="bg-white shadow-2xl print:shadow-none overflow-hidden rounded-3xl">
          <div className="h-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500"></div>
          <div className={`p-4 border-b border-gray-100 ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"><Stethoscope className="w-7 h-7 text-white" /></div>
                <div><h1 className="text-xl font-bold text-gray-800">{data.doctor.hospital}</h1><p className="text-xs text-gray-500">{data.doctor.address}</p><p className="text-xs text-cyan-600">{data.doctor.phone}</p></div>
              </div>
              <div className="text-right"><p className="text-4xl font-bold text-cyan-100">℞</p><p className="text-xs text-gray-500">{data.receiptNo}</p><p className="text-xs text-gray-400">{data.date}</p></div>
            </div>
          </div>

          <div className={`grid grid-cols-2 border-b border-gray-100 ${(!isVisible('doctor_info') && !isVisible('patient_info')) ? 'hide-in-pdf' : ''}`}>
            <div className={`p-4 border-r border-gray-100 ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
              <>
              <div className="flex items-center gap-2 text-cyan-600 mb-2"><Activity className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wide">Consulting Doctor</span></div>
              <h3 className="font-bold text-gray-800">{data.doctor.name}</h3><p className="text-xs text-gray-500">{data.doctor.qualification}</p>
              <div className="flex gap-3 mt-2"><span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">{data.doctor.specialization}</span></div>
              </>
            </div>
            <div className={`p-4 ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
              <>
              <div className="flex items-center gap-2 text-indigo-600 mb-2"><User className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wide">Patient Details</span></div>
              <h3 className="font-bold text-gray-800">{data.patient.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{data.patient.age} Years</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{data.patient.bloodGroup}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{data.patient.weight}</span>
              </div>
              </>
            </div>
          </div>

          <div className={`grid grid-cols-4 gap-0 border-b border-gray-100 ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis') && !isVisible('medical_history') && !isVisible('lab_tests')) ? 'hide-in-pdf' : ''}`}>
            <div className={`p-3 border-r border-gray-100 ${!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}`}>
              <>
              <div className="flex items-center gap-1 mb-2"><Heart className="w-3 h-3 text-rose-500" /><h4 className="text-[10px] font-bold text-rose-600 uppercase">Complaints</h4></div><ul className="space-y-1">{data.symptoms.map((s, i) => <li key={i} className="text-xs text-gray-700 flex items-start gap-1"><span className="text-rose-300 mt-0.5">◆</span>{s}</li>)}</ul>
              </>
            </div>
            <div className={`p-3 border-r border-gray-100 ${!isVisible('diagnosis') ? 'hide-in-pdf' : ''}`}>
              <>
              <div className="flex items-center gap-1 mb-2"><FileText className="w-3 h-3 text-cyan-500" /><h4 className="text-[10px] font-bold text-cyan-600 uppercase">Diagnosis</h4></div><ul className="space-y-1">{data.diagnosis.map((d, i) => <li key={i} className="text-xs text-gray-700 flex items-start gap-1"><span className="text-cyan-300 mt-0.5">◆</span>{d}</li>)}</ul>
              </>
            </div>
            <div className={`p-3 border-r border-gray-100 ${!isVisible('medical_history') ? 'hide-in-pdf' : ''}`}>
              <>
              <div className="flex items-center gap-1 mb-2"><Clipboard className="w-3 h-3 text-purple-500" /><h4 className="text-[10px] font-bold text-purple-600 uppercase">History</h4></div><ul className="space-y-1">{data.patientHistory.map((h, i) => <li key={i} className="text-xs text-gray-700 flex items-start gap-1"><span className="text-purple-300 mt-0.5">◆</span>{h}</li>)}</ul>
              </>
            </div>
            <div className={`p-3 ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}>
              <>
              <div className="flex items-center gap-1 mb-2"><TestTube className="w-3 h-3 text-amber-500" /><h4 className="text-[10px] font-bold text-amber-600 uppercase">Lab Tests</h4></div><ul className="space-y-1">{data.labTests.map((t, i) => <li key={i} className="text-xs text-gray-700"><span className="text-amber-300">◆</span> {t.name}</li>)}</ul>
              </>
            </div>
          </div>

          <div className={`p-4 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-lg flex items-center justify-center"><Pill className="w-4 h-4 text-white" /></div><h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Prescription</h4></div>
            <div className="grid grid-cols-1 gap-2">{data.medications.map((med, i) => (
              <div key={i} className="flex items-stretch bg-gradient-to-r from-cyan-50/50 via-white to-indigo-50/50 rounded-xl border border-gray-100 overflow-hidden">
                <div className="w-10 bg-gradient-to-b from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold">{i + 1}</div>
                <div className="flex-1 p-3 grid grid-cols-6 gap-2 items-center">
                  <div className="col-span-2"><p className="font-semibold text-gray-800 text-sm">{med.name}</p><p className="text-[10px] text-gray-500 italic">{getTranslatedInstructions(med.instructions, language)}</p></div>
                  <div className="text-center"><p className="text-[10px] text-cyan-600 font-medium">DOSE</p><p className="text-xs text-gray-700">{med.dosage}</p></div>
                  <div className="text-center"><p className="text-[10px] text-cyan-600 font-medium">FREQUENCY</p><p className="text-xs text-gray-700">{getTranslatedFrequency(med.frequency, language)}</p></div>
                  <div className="text-center"><p className="text-[10px] text-cyan-600 font-medium">TIMING</p><p className="text-xs text-gray-700">{getTranslatedTiming(med.timing, language)}</p></div>
                  <div className="text-center"><p className="text-[10px] text-cyan-600 font-medium">DURATION</p><p className="text-xs text-gray-700">{getTranslatedDuration(med.duration, language)}</p></div>
                </div>
              </div>
            ))}</div>
          </div>

          <div className={`px-4 pb-4 ${!isVisible('advice_precautions') ? 'hide-in-pdf' : ''}`}><div className="bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-xl p-3 border border-cyan-100"><h4 className="text-xs font-bold text-cyan-700 mb-1">Doctor's Advice</h4><p className="text-xs text-gray-600">{data.notes}</p></div></div>
          
          <div className={`bg-gray-50 p-4 flex justify-between items-end border-t border-gray-100 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
            <div><p className="text-xs text-gray-400">Next Visit</p><p className="text-sm font-bold text-cyan-700">{data.followUpDate}</p></div>
            <div className="text-center"><div className="w-40 h-12 border-b-2 border-cyan-400 mb-1"></div><p className="text-xs text-gray-500">Authorized Signature</p></div>
          </div>
          <div className="h-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500"></div>
        </div>
      </div>
    </div>
  );
};

export default Receipt11;