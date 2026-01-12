import { AlertCircle, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * InvalidHospitalLink
 * Borrowed visual style from AppointmentExpired.tsx to present a clear error
 * when a hospital-hosuid link is not correct or cannot be resolved.
 */
export function InvalidHospitalLink() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] bg-gradient-to-br from-warning/5 via-background to-warning/10 rounded-lg">
      <div className="container max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 mb-4 animate-scale-in">
            <AlertCircle className="w-12 h-12 text-warning" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Link Not Correct
          </h1>
          <p className="text-muted-foreground text-lg">
            Please enter the correct link
          </p>
        </div>

        {/* Notice Card */}
        <Card className="mb-6 border-warning/30 shadow-lg bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="bg-warning/10">
            <CardTitle className="flex items-center gap-2 text-warning">
              <LinkIcon className="w-5 h-5" />
              Invalid Hospital Link
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-2">
                  Why did this happen?
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>The hospital identifier (hosuid) is incorrect or inactive</li>
                  <li>The link format does not match the expected pattern</li>
                  <li>We could not find hospital id and name for this link</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 text-base font-semibold"
            size="lg"
            onClick={() => navigate('/home')}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InvalidHospitalLink;
