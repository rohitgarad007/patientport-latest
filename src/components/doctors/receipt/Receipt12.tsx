import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Pill, TestTube, User, Phone, Calendar, Shield, Award } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, languageLabels, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt12 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 p-4 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <Link to="/receipts" className="flex items-center gap-2 text-emerald-600 hover:underline"><ArrowLeft className="w-4 h-4" />Back to Receipts</Link>
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

        <div ref={receiptRef} className="bg-white shadow-xl print:shadow-none overflow-hidden border border-emerald-200">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400"></div>
            <div className={`bg-gradient-to-b from-emerald-800 to-emerald-900 p-5 ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-2 border-amber-400"><span className="text-3xl text-amber-400 font-serif">℞</span></div>
                  <div><h1 className="text-2xl font-serif font-bold text-white tracking-wide">{data.doctor.hospital}</h1><p className="text-emerald-300 text-sm">{data.doctor.address}</p></div>
                </div>
                <div className="text-right"><p className="text-amber-400 text-xs uppercase tracking-widest">Medical Prescription</p><p className="text-white font-mono text-lg">{data.receiptNo}</p><p className="text-emerald-300 text-xs">{data.date}</p></div>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-5 gap-0 border-b border-emerald-200 ${(!isVisible('doctor_info') && !isVisible('patient_info')) ? 'hide-in-pdf' : ''}`}>
            <div className={`col-span-2 p-4 border-r border-emerald-200 bg-emerald-50/50 ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
              <>
              <div className="flex items-center gap-2 mb-3"><Award className="w-4 h-4 text-amber-600" /><span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Attending Physician</span></div>
              <h3 className="font-serif font-bold text-lg text-gray-800">{data.doctor.name}</h3><p className="text-xs text-gray-600">{data.doctor.qualification}</p><p className="text-xs text-emerald-700">{data.doctor.specialization}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500"><Shield className="w-3 h-3" /> Reg. No: {data.doctor.registrationNo}</div>
              </>
            </div>
            <div className={`col-span-3 p-4 ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
              <>
              <div className="flex items-center gap-2 mb-3"><User className="w-4 h-4 text-emerald-600" /><span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Patient Information</span></div>
              <div className="flex gap-6"><div className="flex-1"><h3 className="font-serif font-bold text-lg text-gray-800">{data.patient.name}</h3><p className="text-xs text-gray-500">{data.patient.address}</p><p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {data.patient.phone}</p></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs"><span className="text-gray-500">Age:</span><span className="text-gray-800 font-medium">{data.patient.age} Years</span><span className="text-gray-500">Gender:</span><span className="text-gray-800 font-medium">{data.patient.gender}</span><span className="text-gray-500">Blood:</span><span className="text-gray-800 font-medium">{data.patient.bloodGroup}</span><span className="text-gray-500">Weight:</span><span className="text-gray-800 font-medium">{data.patient.weight}</span></div></div>
              </>
            </div>
          </div>

          <div className={`grid grid-cols-3 bg-gradient-to-r from-emerald-100 via-green-50 to-lime-50 border-b border-emerald-200 ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis') && !isVisible('medical_history')) ? 'hide-in-pdf' : ''}`}>
            <div className={`p-3 border-r border-emerald-200 ${!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}`}>
              <>
              <h4 className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Chief Complaints</h4><div className="flex flex-wrap gap-1">{data.symptoms.map((s, i) => <span key={i} className="text-xs bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">{s}</span>)}</div>
              </>
            </div>
            <div className={`p-3 border-r border-emerald-200 ${!isVisible('diagnosis') ? 'hide-in-pdf' : ''}`}>
              <>
              <h4 className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Clinical Diagnosis</h4><div className="flex flex-wrap gap-1">{data.diagnosis.map((d, i) => <span key={i} className="text-xs bg-emerald-700 text-white px-2 py-0.5 rounded">{d}</span>)}</div>
              </>
            </div>
            <div className={`p-3 ${!isVisible('medical_history') ? 'hide-in-pdf' : ''}`}>
              <>
              <h4 className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Medical History</h4><div className="flex flex-wrap gap-1">{data.patientHistory.map((h, i) => <span key={i} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">{h}</span>)}</div>
              </>
            </div>
          </div>

          <div className={`p-3 border-b border-emerald-200 ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}><div className="flex items-center gap-2 mb-2"><TestTube className="w-4 h-4 text-emerald-700" /><h4 className="text-xs font-bold text-emerald-700 uppercase">Investigations Required</h4></div><div className="flex gap-3">{data.labTests.map((t, i) => <div key={i} className="flex items-center gap-2 bg-white border border-emerald-200 rounded-lg px-3 py-1.5"><span className="text-xs text-gray-700">{t.name}</span><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.priority === 'High' ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-900'}`}>{t.priority}</span></div>)}</div></div>

          <div className={`p-4 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-3 mb-4"><Pill className="w-5 h-5 text-emerald-700" /><h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Treatment Protocol</h4><div className="flex-1 h-px bg-emerald-200"></div>{language !== "en" && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">{languageLabels[language]}</span>}</div>
            <table className="w-full border border-emerald-200 text-xs">
              <thead><tr className="bg-emerald-800 text-white"><th className="p-2 text-left font-semibold">#</th><th className="p-2 text-left font-semibold">Medication</th><th className="p-2 text-center font-semibold">Dosage</th><th className="p-2 text-center font-semibold">Frequency</th><th className="p-2 text-center font-semibold">Timing</th><th className="p-2 text-center font-semibold">Duration</th><th className="p-2 text-left font-semibold">Instructions</th></tr></thead>
              <tbody>{data.medications.map((med, i) => (
                <tr key={i} className={`border-t border-emerald-100 ${i % 2 === 0 ? 'bg-emerald-50/50' : 'bg-white'}`}>
                  <td className="p-2 font-bold text-emerald-700">{i + 1}</td><td className="p-2 font-medium text-gray-800">{med.name}</td><td className="p-2 text-center text-gray-700">{med.dosage}</td><td className="p-2 text-center text-gray-700">{getTranslatedFrequency(med.frequency, language)}</td>
                  <td className="p-2 text-center"><span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px]">{getTranslatedTiming(med.timing, language)}</span></td><td className="p-2 text-center text-gray-700">{getTranslatedDuration(med.duration, language)}</td><td className="p-2 text-gray-600 italic">{getTranslatedInstructions(med.instructions, language)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          <div className={`px-4 pb-4 ${!isVisible('advice_precautions') ? 'hide-in-pdf' : ''}`}><div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3"><h4 className="text-xs font-bold text-amber-800 mb-1 uppercase">Important Advice</h4><p className="text-xs text-gray-700">{data.notes}</p></div></div>

          <div className={`bg-emerald-50 p-4 border-t border-emerald-200 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
            <div className="flex justify-between items-end">
              <div className="flex gap-6"><div><p className="text-[10px] text-gray-500 uppercase">Follow-up Date</p><p className="text-sm font-bold text-emerald-800 flex items-center gap-1"><Calendar className="w-3 h-3" /> {data.followUpDate}</p></div><div><p className="text-[10px] text-gray-500 uppercase">Contact</p><p className="text-xs text-gray-600">{data.doctor.phone}</p></div></div>
              <div className="text-center"><div className="w-44 h-14 border-b-2 border-emerald-700 mb-1"></div><p className="text-xs text-emerald-700 font-medium">{data.doctor.name}</p><p className="text-[10px] text-gray-500">Physician's Signature & Seal</p></div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400"></div>
        </div>
      </div>
    </div>
  );
};

export default Receipt12;