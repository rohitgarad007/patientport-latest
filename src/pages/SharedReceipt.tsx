import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, FileText, AlertCircle, Loader2, Download, Eye } from "lucide-react";
import { configService } from "@/services/configService";

const SharedReceipt = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const url = await configService.getApiUrl();
        setApiUrl(url);
      } catch (err) {
        console.error("Failed to load config", err);
      }
    };
    fetchConfig();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !token) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('password', password);

      const response = await fetch(`${apiUrl}shared/receipt/verify`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setDownloadUrl(data.download_url);
      } else {
        setError(data.message || "Invalid password or link expired");
      }
    } catch (err) {
      setError("Failed to verify credentials. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (downloadUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
          <CardHeader className="bg-white border-b flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Medical Receipt</CardTitle>
                <CardDescription>Securely viewed</CardDescription>
              </div>
            </div>
            <Button onClick={() => window.open(downloadUrl, '_blank')} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </CardHeader>
          <div className="flex-1 bg-slate-100 p-0 overflow-hidden relative">
             <iframe 
               src={downloadUrl} 
               className="w-full h-full border-0" 
               title="Receipt PDF"
             />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Secured Document</CardTitle>
          <CardDescription className="text-slate-500">
            This medical receipt is password protected. <br/>
            Please enter the 4-digit PIN provided to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter Password"
                  className="text-center text-lg tracking-[0.5em] font-bold h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all"
                  maxLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-lg font-medium shadow-lg shadow-emerald-200"
              disabled={loading || password.length < 1}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  View Receipt
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pb-8 pt-0">
          <p className="text-xs text-slate-400">
            Secured by PatientPort
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SharedReceipt;
