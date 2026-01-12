import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Pill, Stethoscope, TestTube, User, Calendar, Phone, Activity, Droplet, Scale } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt8 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-emerald-50 p-4 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Controls */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <Link to="/receipts" className="flex items-center gap-2 text-teal-600 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Receipts
          </Link>
          <ReceiptControls 
            language={language} 
            onLanguageChange={setLanguage} 
            receiptRef={receiptRef}
            buttonColorClass="bg-teal-600 hover:bg-teal-700"
            disabled={disabled}
            patientId={data.patient.patientId}
            appointmentId={data.appointmentId}
            patientName={data.patient.name}
            patientPhone={data.patient.phone}
          />
        </div>

        {/* Receipt Container */}
        <div ref={receiptRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none border border-teal-100">
          {/* Header */}
          <div className={`bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 p-4 ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-white">{data.doctor.hospital}</h1>
                <p className="text-teal-100 text-xs">{data.doctor.address}</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1">
                <p className="text-white text-xs">Receipt No</p>
                <p className="text-white font-bold text-sm">{data.receiptNo}</p>
              </div>
            </div>
          </div>

          {/* Info Strip */}
          <div className={`grid grid-cols-4 bg-teal-50 border-b border-teal-100 ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
            <div className="p-3 border-r border-teal-100">
              <p className="text-[10px] text-teal-600 uppercase">Date</p>
              <p className="text-sm font-semibold text-gray-800">{data.date}</p>
            </div>
            <div className="p-3 border-r border-teal-100">
              <p className="text-[10px] text-teal-600 uppercase">Patient ID</p>
              <p className="text-sm font-semibold text-gray-800">{data.patient.patientId}</p>
            </div>
            <div className="p-3 border-r border-teal-100">
              <p className="text-[10px] text-teal-600 uppercase">Follow-up</p>
              <p className="text-sm font-semibold text-gray-800">{data.followUpDate}</p>
            </div>
            <div className="p-3">
              <p className="text-[10px] text-teal-600 uppercase">Doctor Reg.</p>
              <p className="text-sm font-semibold text-gray-800">{data.doctor.registrationNo}</p>
            </div>
          </div>

          {/* Doctor & Patient */}
          <div className={`grid grid-cols-2 gap-0 ${(!isVisible('doctor_info') && !isVisible('patient_info')) ? 'hide-in-pdf' : ''}`}>
            <div className={`p-4 border-r border-b border-gray-100 ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-teal-600 uppercase">Consulting Physician</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">{data.doctor.name}</h3>
              <p className="text-xs text-gray-500">{data.doctor.qualification}</p>
              <p className="text-xs text-teal-600">{data.doctor.specialization}</p>
            </div>
            <div className={`p-4 border-b border-gray-100 ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-600 uppercase">Patient Details</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">{data.patient.name}</h3>
              <div className="flex gap-4 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" /> {data.patient.age} Years
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Droplet className="w-3 h-3" /> {data.patient.bloodGroup}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Scale className="w-3 h-3" /> {data.patient.weight}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Info */}
          <div className={`grid grid-cols-3 gap-0 border-b border-gray-100 ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis') && !isVisible('medical_history')) ? 'hide-in-pdf' : ''}`}>
            <div className={`p-3 border-r border-gray-100 ${!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}`}>
              <h4 className="text-[10px] font-bold text-teal-600 uppercase mb-2 border-b border-teal-200 pb-1">Presenting Complaints</h4>
              <div className="space-y-1">
                {data.symptoms.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-gray-700">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>{s}
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-3 border-r border-gray-100 ${!isVisible('diagnosis') ? 'hide-in-pdf' : ''}`}>
              <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-2 border-b border-emerald-200 pb-1">Clinical Diagnosis</h4>
              <div className="space-y-1">
                {data.diagnosis.map((d, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-gray-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>{d}
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-3 ${!isVisible('medical_history') ? 'hide-in-pdf' : ''}`}>
              <h4 className="text-[10px] font-bold text-green-600 uppercase mb-2 border-b border-green-200 pb-1">Medical History</h4>
              <div className="space-y-1">
                {data.patientHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-gray-700">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{h}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lab Tests */}
          <div className={`p-3 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-emerald-50/50 ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <TestTube className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-bold text-teal-600 uppercase">Investigations Advised</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.labTests.map((t, i) => (
                <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-teal-200">
                  <span className="text-xs text-gray-700">{t.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    t.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>{t.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div className={`p-3 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-teal-600 uppercase">Prescription</h4>
              <span className="text-3xl font-serif text-teal-300 ml-auto">℞</span>
            </div>
            <div className="border border-teal-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-100 to-emerald-100">
                    <th className="text-left p-2 text-teal-700 font-semibold">Sr.</th>
                    <th className="text-left p-2 text-teal-700 font-semibold">Medicine Name</th>
                    <th className="text-left p-2 text-teal-700 font-semibold">Dose</th>
                    <th className="text-left p-2 text-teal-700 font-semibold">When</th>
                    <th className="text-left p-2 text-teal-700 font-semibold">Duration</th>
                    <th className="text-left p-2 text-teal-700 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.medications.map((med, i) => (
                    <tr key={i} className="border-t border-teal-100 hover:bg-teal-50/30">
                      <td className="p-2 font-bold text-teal-600">{i + 1}</td>
                      <td className="p-2 font-medium text-gray-800">{med.name}</td>
                      <td className="p-2 text-gray-600">{med.dosage}</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]">{getTranslatedTiming(med.timing, language)}</span>
                      </td>
                      <td className="p-2 text-gray-600">{getTranslatedDuration(med.duration, language)}</td>
                      <td className="p-2 text-gray-500 italic">{getTranslatedInstructions(med.instructions, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advice & Footer */}
          <div className={`p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border-t border-teal-100 ${(!isVisible('medications') && !isVisible('footer')) ? 'hide-in-pdf' : ''}`}>
            <div className={`flex items-start gap-2 mb-3 ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
              <Activity className="w-4 h-4 text-teal-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-teal-700">Advice & Precautions</h4>
                <p className="text-xs text-gray-600 mt-1">{data.notes}</p>
              </div>
            </div>
            <div className={`flex justify-between items-end pt-3 border-t border-teal-200 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
              <div className="text-xs text-gray-500">
                <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.doctor.phone} | {data.doctor.email}</p>
              </div>
              <div className="text-center">
                <div className="w-36 h-12 border-b-2 border-teal-400 mb-1"></div>
                <p className="text-xs text-teal-600 font-medium">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt8;

