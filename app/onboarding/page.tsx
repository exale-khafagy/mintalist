"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadButton } from "@/lib/uploadthing";

const SOCIAL_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

function GetLocationButton({
  onSuccess,
  onError,
}: {
  onSuccess: (lat: number, lng: number) => void;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  function handleClick() {
    if (!navigator.geolocation) {
      onError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    onError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSuccess(pos.coords.latitude, pos.coords.longitude);
        setLoading(false);
      },
      (err) => {
        onError(err.message || "Could not get location.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      <MapPin className="mr-2 h-4 w-4" />
      {loading ? "Getting location…" : "Use my current location"}
    </Button>
  );
}

const onboardingSchema = z.object({
  // Step 1: Business name and location
  name: z.string().min(2, "Business name is required"),
  locationName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  brandColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Invalid color"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Step 2: Logo
  logoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  // Step 3: Links (JSON string for form)
  socialLinks: z.string().optional(),
  customLinks: z.string().optional(),
  // Step 4: Plan preference (team sends promo code)
  planPreference: z.enum(["FREE_ALWAYS", "GOLD_1_MONTH", "PLATINUM_2_WEEKS"]).optional(),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const STEPS = [
  { title: "Your business name and location", description: "Tell us about your business. You can change this later." },
  { title: "Logo", description: "Upload your logo." },
  { title: "Links", description: "Social and custom links." },
  { title: "Choose your plan", description: "Pick the plan that fits." },
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      locationName: "",
      address: "",
      phone: "",
      brandColor: "#10B981",
      logoUrl: "",
      socialLinks: "[]",
      customLinks: "[]",
      planPreference: "FREE_ALWAYS",
      latitude: undefined,
      longitude: undefined,
    },
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }
  }, [isLoaded, user, router]);

  async function saveStep2() {
    const { name, locationName, address, phone, brandColor, latitude, longitude } = form.getValues();
    const res = await fetch("/api/vendor/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || undefined,
        locationName: locationName || undefined,
        address: address || undefined,
        phone: phone || undefined,
        brandColor: brandColor || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to save");
    }
  }

  async function saveStep3() {
    const { logoUrl } = form.getValues();
    await fetch("/api/vendor/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl: logoUrl || undefined }),
    });
  }

  async function saveStep4() {
    let socialLinks: { platform: string; url: string }[] = [];
    let customLinks: { title: string; url: string }[] = [];
    try {
      socialLinks = JSON.parse(form.getValues("socialLinks") || "[]");
      customLinks = JSON.parse(form.getValues("customLinks") || "[]");
    } catch {
      /* ignore */
    }
    for (const link of socialLinks) {
      if (!link.url?.startsWith("http")) continue;
      await fetch("/api/vendor/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "social", platform: link.platform, url: link.url }),
      });
    }
    for (const link of customLinks) {
      if (!link.title?.trim() || !link.url?.startsWith("http")) continue;
      await fetch("/api/vendor/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "custom", title: link.title.trim(), url: link.url }),
      });
    }
  }

  async function handleNext() {
    setError(null);
    // Step 1: Business name and location
    if (step === 1) {
      const ok = await form.trigger(["name", "brandColor"]);
      if (!ok) return;
      setIsSubmitting(true);
      try {
        await saveStep2();
        setStep(2);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    // Step 2: Logo
    if (step === 2) {
      setIsSubmitting(true);
      try {
        await saveStep3();
        setStep(3);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    // Step 3: Links
    if (step === 3) {
      setIsSubmitting(true);
      try {
        await saveStep4();
        setStep(4);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    // Step 4: Plan preference (team will send promo code)
    if (step === 4) {
      const pref = form.getValues("planPreference") ?? "FREE_ALWAYS";
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/vendor/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planPreference: pref }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to save");
        }
        router.push("/dashboard?onboarding=complete");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  }

  function handleBack() {
    setError(null);
    if (step > 1) setStep(step - 1);
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const current = STEPS[step - 1]!;
  const isLastStep = step === 4;
  const planPreference = form.watch("planPreference");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-3 py-4 sm:px-4 sm:py-6">
      <Card className="flex w-full max-w-md max-h-[90dvh] min-h-0 flex-col">
        <CardHeader className="shrink-0">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Step {step} of 4</span>
            <div className="flex-1 flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${s <= step ? "bg-emerald-600" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>
          <CardTitle>{current.title}</CardTitle>
          <CardDescription>{current.description}</CardDescription>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
          {step === 1 && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Business name</label>
                <Input
                  {...form.register("name")}
                  placeholder="e.g. Mint Cafe"
                  className="mt-1"
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Location name</label>
                <Input
                  {...form.register("locationName")}
                  placeholder="e.g. Downtown"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Address</label>
                <Input
                  {...form.register("address")}
                  placeholder="Street, city"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Phone</label>
                <Input
                  {...form.register("phone")}
                  placeholder="+20..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Your location</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Use your browser to save your coordinates. No API key required.
                </p>
                <GetLocationButton
                  onSuccess={(lat, lng) => {
                    form.setValue("latitude", lat, { shouldValidate: false });
                    form.setValue("longitude", lng, { shouldValidate: false });
                  }}
                  onError={(msg) => setError(msg)}
                />
                {(form.watch("latitude") != null && form.watch("longitude") != null) && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Saved: {form.watch("latitude")?.toFixed(5)}, {form.watch("longitude")?.toFixed(5)}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Brand color</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    {...form.register("brandColor")}
                    className="h-10 w-14 cursor-pointer rounded border border-border p-1"
                  />
                  <Input
                    {...form.register("brandColor")}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">Upload from device or paste a URL. Optional.</p>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                <UploadButton
                  endpoint="logoUploader"
                  onClientUploadComplete={(res) => {
                    setError(null);
                    const url = res?.[0]?.url;
                    if (url) form.setValue("logoUrl", url, { shouldValidate: false });
                  }}
                  onUploadError={(err: Error) => setError(err.message)}
                  content={{ button: "Upload from device" }}
                  className="ut-button:bg-emerald-600 ut-button:ut-readying:bg-emerald-600/50 ut-button:text-white ut-button:text-sm ut-button:rounded-md ut-button:px-3 ut-button:py-1.5"
                />
                <span className="text-xs text-muted-foreground">or</span>
                <Input
                  {...form.register("logoUrl")}
                  placeholder="Paste image URL"
                  className="h-8 flex-1 min-w-[120px] text-sm"
                />
              </div>
              {form.watch("logoUrl")?.startsWith("http") && (
                <img
                  src={form.watch("logoUrl") ?? ""}
                  alt="Logo preview"
                  className="h-14 w-14 rounded-full border border-border object-cover"
                />
              )}
            </>
          )}

          {step === 3 && (
            <OnboardingLinksStep form={form} />
          )}

          {step === 4 && (
            <OnboardingPlanStep form={form} />
          )}

          {error && (
            <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>
          )}
        </CardContent>

        <CardFooter className="flex shrink-0 justify-between border-t border-border pt-4">
          {step === 1 ? (
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Skip for now
            </Link>
          ) : (
            <Button type="button" variant="ghost" onClick={handleBack} disabled={isSubmitting}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isLastStep ? "Finish" : "Next"}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function OnboardingLinksStep({ form }: { form: ReturnType<typeof useForm<OnboardingValues>> }) {
  const [social, setSocial] = useState<{ platform: string; url: string }[]>([]);
  const [custom, setCustom] = useState<{ title: string; url: string }[]>([]);

  useEffect(() => {
    try {
      setSocial(JSON.parse(form.getValues("socialLinks") || "[]"));
      setCustom(JSON.parse(form.getValues("customLinks") || "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  function addSocial() {
    const next = [...social, { platform: "instagram", url: "" }];
    setSocial(next);
    form.setValue("socialLinks", JSON.stringify(next));
  }

  function addCustom() {
    const next = [...custom, { title: "", url: "" }];
    setCustom(next);
    form.setValue("customLinks", JSON.stringify(next));
  }

  function updateSocial(i: number, field: "platform" | "url", value: string) {
    const next = social.map((s, idx) => (idx === i ? { ...s, [field]: value } : s));
    setSocial(next);
    form.setValue("socialLinks", JSON.stringify(next));
  }

  function updateCustom(i: number, field: "title" | "url", value: string) {
    const next = custom.map((c, idx) => (idx === i ? { ...c, [field]: value } : c));
    setCustom(next);
    form.setValue("customLinks", JSON.stringify(next));
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">Add social and custom links. Optional.</p>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Social links</p>
        {social.map((s, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <select
              value={s.platform}
              onChange={(e) => updateSocial(i, "platform", e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            >
              {SOCIAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <Input
              value={s.url}
              onChange={(e) => updateSocial(i, "url", e.target.value)}
              placeholder="https://..."
              className="flex-1 text-sm"
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addSocial}>
          + Add social link
        </Button>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Custom links</p>
        {custom.map((c, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <Input
              value={c.title}
              onChange={(e) => updateCustom(i, "title", e.target.value)}
              placeholder="Title"
              className="w-28 text-sm"
            />
            <Input
              value={c.url}
              onChange={(e) => updateCustom(i, "url", e.target.value)}
              placeholder="https://..."
              className="flex-1 text-sm"
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addCustom}>
          + Add custom link
        </Button>
      </div>
    </>
  );
}

const PLAN_PRESETS = [
  { value: "FREE_ALWAYS" as const, label: "Join Free always", description: "Silver plan. Our team may contact you with a promo code for upgrades later." },
  { value: "GOLD_1_MONTH" as const, label: "Try Gold 1 month for free", description: "Gold features for 1 month. We'll send you a promo code and contact you for renewals." },
];

function OnboardingPlanStep({ form }: { form: ReturnType<typeof useForm<OnboardingValues>> }) {
  const planPreference = form.watch("planPreference");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose an option. Our team will contact you and send a promo code where applicable.
      </p>
      <div className="grid gap-3">
        {PLAN_PRESETS.map((preset) => (
          <label
            key={preset.value}
            className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 transition ${planPreference === preset.value ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20" : "border-border hover:border-muted-foreground/50"}`}
          >
            <input
              type="radio"
              name="planPreference"
              value={preset.value}
              checked={planPreference === preset.value}
              onChange={() => form.setValue("planPreference", preset.value)}
              className="sr-only"
            />
            <span className="font-semibold text-foreground">{preset.label}</span>
            <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
          </label>
        ))}
      </div>
    </div>
  );
}
