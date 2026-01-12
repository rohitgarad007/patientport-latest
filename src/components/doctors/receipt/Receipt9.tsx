import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Pill, TestTube, Phone, Heart, Thermometer } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt9 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-stone-100 to-zinc-100 p-4 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <Link to="/receipts" className="flex items-center gap-2 text-stone-600 hover:underline">
            <ArrowLeft className="w-4 h-4" />Back to Receipts
          </Link>
          <ReceiptControls 
            language={language} 
            onLanguageChange={setLanguage} 
            receiptRef={receiptRef} 
            buttonColorClass="bg-stone-600 hover:bg-stone-700" 
            disabled={disabled}
            patientId={data.patient.patientId}
            appointmentId={data.appointmentId}
            patientName={data.patient.name}
            patientPhone={data.patient.phone}
          />
        </div>

        <div ref={receiptRef} className="bg-white shadow-xl print:shadow-none border-4 border-double border-stone-300">
          <div className={`border-b-4 border-double border-stone-300 p-4 text-center ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-stone-500">{data.date}</span>
              <span className="text-xs text-stone-500">{data.receiptNo}</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-stone-800 tracking-wide">{data.doctor.hospital}</h1>
            <p className="text-xs text-stone-500 mt-1">{data.doctor.address} • {data.doctor.phone}</p>
          </div>

          <div className="grid grid-cols-12 divide-x divide-stone-200">
            <div className="col-span-5 p-3">
              <div className={`mb-4 ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
                <h3 className="text-xs font-bold uppercase text-stone-500 border-b border-stone-200 pb-1 mb-2">Attending Physician</h3>
                <p className="font-serif font-bold text-stone-800">{data.doctor.name}</p>
                <p className="text-xs text-stone-600">{data.doctor.qualification}</p>
                <p className="text-xs text-stone-400 mt-1">Reg. {data.doctor.registrationNo}</p>
              </div>
              <div className={`bg-stone-50 p-3 mb-4 border border-stone-200 ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
                <h3 className="text-xs font-bold uppercase text-stone-500 mb-2">Patient Information</h3>
                <p className="font-bold text-stone-800">{data.patient.name}</p>
                <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-stone-600">
                  <span>Age: {data.patient.age} years</span>
                  <span>Sex: {data.patient.gender}</span>
                  <span>Blood: {data.patient.bloodGroup}</span>
                  <span>Weight: {data.patient.weight}</span>
                </div>
              </div>
              <div className={`mb-4 ${!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}`}>
                <h3 className="text-xs font-bold uppercase text-stone-500 border-b border-stone-200 pb-1 mb-2 flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> Chief Complaints
                </h3>
                <ul className="text-xs text-stone-700 space-y-1">
                  {data.symptoms.map((s, i) => <li key={i} className="flex items-start gap-1"><span className="text-stone-400">▪</span> {s}</li>)}
                </ul>
              </div>
              <div className={`mb-4 ${!isVisible('medical_history') ? 'hide-in-pdf' : ''}`}>
                <h3 className="text-xs font-bold uppercase text-stone-500 border-b border-stone-200 pb-1 mb-2 flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Past Medical History
                </h3>
                <ul className="text-xs text-stone-600 space-y-1">
                  {data.patientHistory.map((h, i) => <li key={i}>• {h}</li>)}
                </ul>
              </div>
              <div className={`bg-stone-800 text-white p-3 ${!isVisible('diagnosis') ? 'hide-in-pdf' : ''}`}>
                <h3 className="text-xs font-bold uppercase mb-2">Clinical Diagnosis</h3>
                {data.diagnosis.map((d, i) => <p key={i} className="text-sm font-serif">— {d}</p>)}
              </div>
            </div>

            <div className="col-span-7 p-3">
              <div className="text-6xl font-serif text-stone-200 float-left mr-2 leading-none">℞</div>
              <div className={`mb-4 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
                <h3 className="text-xs font-bold uppercase text-stone-500 border-b border-stone-200 pb-1 mb-3">Prescribed Medications</h3>
                <div className="space-y-2">
                  {data.medications.map((med, i) => (
                    <div key={i} className="border-l-2 border-stone-300 pl-3 py-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-stone-400">{i + 1}.</span>
                        <span className="font-medium text-stone-800">{med.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-1 text-xs text-stone-600">
                        <span>Dose: {med.dosage}</span>
                        <span>{getTranslatedFrequency(med.frequency, language)}</span>
                        <span>{getTranslatedDuration(med.duration, language)}</span>
                      </div>
                      <p className="text-xs text-stone-500 italic mt-0.5">↳ {getTranslatedInstructions(med.instructions, language)} ({getTranslatedTiming(med.timing, language)})</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`bg-stone-50 p-3 mb-4 border border-stone-200 ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}>
                <h3 className="text-xs font-bold uppercase text-stone-500 mb-2 flex items-center gap-1">
                  <TestTube className="w-3 h-3" /> Laboratory Investigations
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {data.labTests.map((t, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-stone-700">{i + 1}. {t.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-medium ${t.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.priority.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`border border-stone-300 p-3 bg-stone-50 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
                <h3 className="text-xs font-bold uppercase text-stone-500 mb-1">Medical Advice</h3>
                <p className="text-xs text-stone-700 leading-relaxed">{data.notes}</p>
              </div>
              <div className={`mt-4 flex justify-between items-end ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
                <div className="bg-stone-100 px-3 py-2 border border-stone-200">
                  <p className="text-xs text-stone-500">Next Appointment</p>
                  <p className="text-sm font-bold text-stone-800">{data.followUpDate}</p>
                </div>
                <div className="text-right">
                  <div className="w-40 h-10 border-b-2 border-stone-400 mb-1"></div>
                  <p className="text-xs text-stone-500">Physician's Signature</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`border-t-2 border-stone-300 p-2 text-center ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
            <p className="text-[10px] text-stone-500">This prescription is computer generated. Valid for 7 days from the date of issue.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt9;