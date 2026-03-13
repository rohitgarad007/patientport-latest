import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicHospitalInfo } from "@/services/PublicHomeService";
import { hospitalService, HospitalWebsiteSettings } from "@/services/HospitalService";

const LiveTemplate1 = lazy(() => import("@/components/liveTemplates/LiveTemplate1"));
const LiveTemplate2 = lazy(() => import("@/components/liveTemplates/LiveTemplate2"));
const LiveTemplate3 = lazy(() => import("@/components/liveTemplates/LiveTemplate3"));
const LiveTemplate4 = lazy(() => import("@/components/liveTemplates/LiveTemplate4"));

type Params = {
  hospital_name?: string;
  hospital_uid?: string;
};

export default function LiveHospitalWebsite() {
  const params = useParams<Params>();
  const hospitalUid = String(params.hospital_uid ?? "");

  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [websiteSettings, setWebsiteSettings] = useState<HospitalWebsiteSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!hospitalUid) {
          setInvalid(true);
          return;
        }
        setLoading(true);
        setInvalid(false);

        const info = await fetchPublicHospitalInfo(hospitalUid);
        if (cancelled) return;

        if (!info?.id) {
          setInvalid(true);
          return;
        }
        setHospitalName(String(info.name ?? ""));

        const web = await hospitalService.getWebsiteSettings(hospitalUid);
        if (cancelled) return;

        setWebsiteSettings(web);
      } catch {
        if (!cancelled) setInvalid(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hospitalUid]);

  useEffect(() => {
    if (!hospitalName) return;
    document.title = hospitalName;
  }, [hospitalName]);

  const templateId = useMemo(() => {
    const key = websiteSettings?.website_template || "template_1";
    const map: Record<string, 1 | 2 | 3 | 4> = {
      template_1: 1,
      template_2: 2,
      template_3: 3,
      template_4: 4,
    };
    return map[key] ?? 1;
  }, [websiteSettings?.website_template]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading website…</div>
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Invalid hospital link</div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading template…</div>
        </div>
      }
    >
      {templateId === 1 ? (
        <LiveTemplate1 />
      ) : templateId === 2 ? (
        <LiveTemplate2 />
      ) : templateId === 3 ? (
        <LiveTemplate3 />
      ) : (
        <LiveTemplate4 />
      )}
    </Suspense>
  );
}

