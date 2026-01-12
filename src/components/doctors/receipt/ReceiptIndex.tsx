import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Palette, Moon, Heart, Layers, Table2, Sparkles, Leaf, Newspaper, Wand2, Zap, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const receiptStyles = [
  { id: 1, title: "Classic Professional", description: "Clean design with gradient header", icon: FileText, path: "/receipt-1", colors: "from-primary to-primary/80", preview: "bg-gradient-to-r from-primary/20 to-primary/10" },
  { id: 2, title: "Modern Card Style", description: "Contemporary emerald/teal theme", icon: Palette, path: "/receipt-2", colors: "from-emerald-500 to-teal-600", preview: "bg-gradient-to-r from-emerald-100 to-teal-100" },
  { id: 3, title: "Dark Modern Theme", description: "Sleek dark mode with sky blue accents", icon: Moon, path: "/receipt-3", colors: "from-sky-600 to-indigo-600", preview: "bg-gradient-to-r from-slate-700 to-slate-800" },
  { id: 4, title: "Elegant Warm Design", description: "Rose and amber tones with elegance", icon: Heart, path: "/receipt-4", colors: "from-rose-400 to-amber-400", preview: "bg-gradient-to-r from-rose-100 to-amber-100" },
  { id: 5, title: "Premium Hybrid", description: "Layered cards with professional flow", icon: Layers, path: "/receipt-5", colors: "from-primary to-indigo-600", preview: "bg-gradient-to-r from-primary/15 to-indigo-100" },
  { id: 6, title: "Corporate Medical", description: "Clean tabular structured format", icon: Table2, path: "/receipt-6", colors: "from-slate-700 to-blue-600", preview: "bg-gradient-to-r from-slate-100 to-blue-50" },
  { id: 7, title: "Warm Sunset", description: "Amber & rose gradient with diagonal design", icon: Sparkles, path: "/receipt-7", colors: "from-amber-500 to-rose-500", preview: "bg-gradient-to-r from-amber-100 to-rose-100" },
  { id: 8, title: "Fresh Teal", description: "Clean teal with rounded modern cards", icon: Leaf, path: "/receipt-8", colors: "from-teal-500 to-emerald-500", preview: "bg-gradient-to-r from-teal-100 to-emerald-100" },
  { id: 9, title: "Newspaper Classic", description: "Editorial newspaper-style columns", icon: Newspaper, path: "/receipt-9", colors: "from-stone-600 to-stone-800", preview: "bg-gradient-to-r from-stone-100 to-zinc-100" },
  { id: 10, title: "Violet Wave", description: "Purple gradients with wavy header", icon: Wand2, path: "/receipt-10", colors: "from-violet-500 to-fuchsia-500", preview: "bg-gradient-to-r from-violet-100 to-fuchsia-100" },
  { id: 11, title: "Cyan Modern", description: "Gradient strips with 4-column clinical grid", icon: Zap, path: "/receipt-11", colors: "from-cyan-500 to-indigo-500", preview: "bg-gradient-to-r from-cyan-100 to-indigo-100" },
  { id: 12, title: "Executive Green", description: "Premium emerald with gold accents", icon: Award, path: "/receipt-12", colors: "from-emerald-700 to-green-600", preview: "bg-gradient-to-r from-emerald-100 to-lime-100" }
];

const ReceiptIndex = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Navigation */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to EMR System
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Prescription Receipt Templates
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Choose from 12 professionally designed doctor receipt templates. Each template displays complete prescription information including patient details, symptoms, diagnosis, lab tests, and medications.
          </p>
        </div>
      </div>

      {/* Receipt Cards Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4">
        {receiptStyles.map((style) => (
          <Link key={style.id} to={style.path} className="block group">
            <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-2 border-transparent hover:border-primary/20">
              {/* Preview Strip */}
              <div className={`h-24 ${style.preview} flex items-center justify-center relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${style.colors} opacity-20`}></div>
                <div className={`w-16 h-16 bg-gradient-to-br ${style.colors} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <style.icon className="w-8 h-8" />
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{style.title}</CardTitle>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    Receipt {style.id}
                  </span>
                </div>
                <CardDescription>{style.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary font-medium group-hover:underline">
                    View Template →
                  </span>
                  <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${style.colors}`}></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto mt-12">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">All Templates Include:</h2>
          <div className="grid md:grid-cols-4 gap-4 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Complete patient information</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Symptoms & diagnosis details</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Lab test recommendations</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Medication with dosage instructions</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Doctor & hospital details</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Follow-up appointment date</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Print-ready format</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Mobile responsive design</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptIndex;
