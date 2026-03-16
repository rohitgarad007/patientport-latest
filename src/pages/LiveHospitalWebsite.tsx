import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicHospitalInfo } from "@/services/PublicHomeService";
import { hospitalService, HospitalAmenityItem, HospitalPublicAbout, HospitalPublicBanner, HospitalPublicDoctor, HospitalSpecializationItem, HospitalWebsiteSettings } from "@/services/HospitalService";

const LiveTemplate1 = lazy(() => import("@/components/liveTemplates/LiveTemplate1"));
const LiveTemplate2 = lazy(() => import("@/components/liveTemplates/LiveTemplate2"));
const LiveTemplate3 = lazy(() => import("@/components/liveTemplates/LiveTemplate3"));
const LiveTemplate4 = lazy(() => import("@/components/liveTemplates/LiveTemplate4"));

type Params = {
  hospital_name?: string;
  hospital_uid?: string;
};

type HospitalContactInfo = {
  address?: string;
  phone?: string;
  email?: string;
};

export default function LiveHospitalWebsite() {
  const params = useParams<Params>();
  const hospitalUid = String(params.hospital_uid ?? "");

  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalContact, setHospitalContact] = useState<HospitalContactInfo | null>(null);
  const [websiteSettings, setWebsiteSettings] = useState<HospitalWebsiteSettings | null>(null);
  const [specializations, setSpecializations] = useState<HospitalSpecializationItem[]>([]);
  const [doctors, setDoctors] = useState<HospitalPublicDoctor[]>([]);
  const [about, setAbout] = useState<HospitalPublicAbout | null>(null);
  const [amenities, setAmenities] = useState<HospitalAmenityItem[]>([]);
  const [banners, setBanners] = useState<HospitalPublicBanner[]>([]);

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
        setHospitalContact({
          address: String(info.address ?? ""),
          phone: String(info.phone ?? ""),
          email: String(info.email ?? ""),
        });

        const [web, specs, docs, aboutInfo, amenityItems, bannerItems] = await Promise.all([
          hospitalService.getWebsiteSettings(hospitalUid),
          hospitalService.getPublicHospitalSpecializations(hospitalUid),
          hospitalService.getPublicHospitalDoctors(hospitalUid),
          hospitalService.getPublicHospitalAbout(hospitalUid),
          hospitalService.getPublicHospitalAmenities(hospitalUid),
          hospitalService.getPublicHospitalBanners(hospitalUid),
        ]);
        if (cancelled) return;

        setWebsiteSettings(web);
        setSpecializations(specs);
        setDoctors(docs);
        setAbout(aboutInfo);
        setAmenities(amenityItems);
        setBanners(bannerItems);
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
        <LiveTemplate1 hospitalName={hospitalName} specializations={specializations} doctors={doctors} about={about} amenities={amenities} contact={hospitalContact} banners={banners} />
      ) : templateId === 2 ? (
        <LiveTemplate2 hospitalName={hospitalName} specializations={specializations} doctors={doctors} about={about} amenities={amenities} />
      ) : templateId === 3 ? (
        <LiveTemplate3 hospitalName={hospitalName} specializations={specializations} doctors={doctors} about={about} amenities={amenities} />
      ) : (
        <LiveTemplate4 hospitalName={hospitalName} specializations={specializations} doctors={doctors} about={about} amenities={amenities} />
      )}
    </Suspense>
  );
}
