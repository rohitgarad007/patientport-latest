import { useState, useRef } from "react";
import { dummyPrescriptionData } from "@/data/receiptData";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, User, Pill, FlaskConical, Stethoscope, FileText, Activity, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import ReceiptControls from "@/components/receipt/ReceiptControls";
import { Language, getTranslatedFrequency, getTranslatedDuration, getTranslatedTiming, getTranslatedInstructions } from "@/data/translations";
import { ReceiptProps } from "@/types/receipt";

const Receipt5 = ({ data: propsData, disabled, contentSettings }: ReceiptProps) => {
  const data = propsData || dummyPrescriptionData;
  const [language, setLanguage] = useState<Language>("mr");
  const receiptRef = useRef<HTMLDivElement>(null);

  const isVisible = (key: string) => !contentSettings || contentSettings[`${key}_status`] != 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-primary/5 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Navigation */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link to="/receipts" className="flex items-center gap-2 text-primary hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Receipts
        </Link>
        <ReceiptControls 
          language={language} 
          onLanguageChange={setLanguage} 
          receiptRef={receiptRef}
          disabled={disabled}
          patientId={data.patient.patientId}
          appointmentId={data.appointmentId}
          patientName={data.patient.name}
          patientPhone={data.patient.phone}
        />
      </div>

      {/* Receipt Container */}
      <div ref={receiptRef} className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200 print:shadow-none print:rounded-none print:border-none">
        {/* Header */}
        <div className={`relative overflow-hidden ${!isVisible('header') ? 'hide-in-pdf' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{data.doctor.hospital}</h1>
                  <p className="text-white/80 text-sm mt-1">{data.doctor.address}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/70">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{data.doctor.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{data.doctor.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-white">
                <div className="text-xs uppercase tracking-widest text-white/60 mb-1">Medical Prescription</div>
                <div className="text-xl font-bold">{data.receiptNo}</div>
                <div className="flex items-center gap-2 mt-2 text-sm text-white/80">
                  <Calendar className="w-4 h-4" />
                  {data.date}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor & Patient Section */}
        <div className={`grid md:grid-cols-2 gap-0 border-b ${(!isVisible('doctor_info') && !isVisible('patient_info')) ? 'hide-in-pdf' : ''}`}>
          <div className={`p-6 bg-gradient-to-br from-slate-50 to-white border-r border-b md:border-b-0 ${!isVisible('doctor_info') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold text-slate-800">Consulting Physician</h2>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">{data.doctor.name}</h3>
              <p className="text-slate-600">{data.doctor.qualification}</p>
              <p className="text-slate-500 text-sm">{data.doctor.specialization}</p>
              <div className="pt-2 border-t mt-3">
                <p className="text-xs text-slate-400">Registration No.</p>
                <p className="font-medium text-slate-700">{data.doctor.registrationNo}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 bg-gradient-to-br from-primary/5 to-white ${!isVisible('patient_info') ? 'hide-in-pdf' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold text-slate-800">Patient Information</h2>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{data.patient.name}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Patient ID</p>
                <p className="font-medium">{data.patient.patientId}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Age / Gender</p>
                <p className="font-medium">{data.patient.age} yrs / {data.patient.gender}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Blood Group</p>
                <p className="font-medium text-red-600">{data.patient.bloodGroup}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Weight / Height</p>
                <p className="font-medium">{data.patient.weight} / {data.patient.height}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 text-xs">Contact</p>
                <p className="font-medium">{data.patient.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Assessment Section */}
        <div className={`p-6 border-b ${(!isVisible('presenting_symptoms') && !isVisible('diagnosis') && !isVisible('medical_history')) ? 'hide-in-pdf' : ''}`}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className={!isVisible('presenting_symptoms') ? 'hide-in-pdf' : ''}>
              <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
                <FileText className="w-5 h-5 text-amber-500" />
                Chief Complaints
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.symptoms.map((symptom, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200">
                    <AlertCircle className="w-3 h-3" />
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
            
            <div className={!isVisible('diagnosis') ? 'hide-in-pdf' : ''}>
              <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
                <Stethoscope className="w-5 h-5 text-primary" />
                Diagnosis
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.diagnosis.map((diag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20">
                    <CheckCircle2 className="w-3 h-3" />
                    {diag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className={!isVisible('medical_history') ? 'hide-in-pdf' : ''}>
              <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
                <Activity className="w-5 h-5 text-purple-500" />
                Medical History
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.patientHistory.map((history, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-200">
                    {history}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lab Tests Section */}
        <div className={`p-6 border-b bg-slate-50/50 ${!isVisible('lab_tests') ? 'hide-in-pdf' : ''}`}>
          <h2 className="flex items-center gap-2 font-bold text-lg text-slate-800 mb-4">
            <FlaskConical className="w-5 h-5 text-indigo-500" />
            Recommended Investigations
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {data.labTests.map((test, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  test.priority === 'High' ? 'bg-red-500' : 'bg-amber-400'
                }`}></div>
                <div>
                  <p className="font-medium text-slate-800">{test.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                    test.priority === 'High' 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {test.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medications Section */}
        <div className={`p-6 border-b ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
          <h2 className="flex items-center gap-2 font-bold text-lg text-slate-800 mb-4">
            <Pill className="w-5 h-5 text-blue-500" />
            Prescribed Medications
            <span className="ml-2 text-sm font-normal text-slate-400">({data.medications.length} medicines)</span>
          </h2>
          
          <div className="space-y-3">
            {data.medications.map((med, idx) => (
              <div key={idx} className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100 overflow-hidden">
                <div className="flex flex-wrap items-center p-4 gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="font-bold text-slate-800">{med.name}</h4>
                    <p className="text-sm text-slate-500">{med.dosage}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
                      <Clock className="w-3 h-3 text-primary" />
                      {getTranslatedFrequency(med.frequency, language)}
                    </span>
                    <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
                      {getTranslatedDuration(med.duration, language)}
                    </span>
                    <span className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium">
                      {getTranslatedTiming(med.timing, language)}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/50 border-t border-blue-100 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Instructions:</span> {getTranslatedInstructions(med.instructions, language)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div className={`p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b ${!isVisible('medications') ? 'hide-in-pdf' : ''}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 mb-1">Special Instructions & Advice</h3>
              <p className="text-amber-900">{data.notes}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Next Follow-up</p>
              <p className="text-xl font-bold text-primary">{data.followUpDate}</p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <div className="inline-block">
              <div className="h-16 flex items-end justify-center mb-1">
                <div className="text-3xl font-signature text-slate-400 italic">Signature</div>
              </div>
              <div className="border-t-2 border-slate-400 pt-2 px-12">
                <p className="font-bold text-slate-800">{data.doctor.name}</p>
                <p className="text-sm text-slate-500">{data.doctor.qualification}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Contact Bar */}
        <div className={`bg-gradient-to-r from-primary to-primary/90 px-6 py-4 ${!isVisible('footer') ? 'hide-in-pdf' : ''}`}>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/90">
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
    </div>
  );
};

export default Receipt5;

