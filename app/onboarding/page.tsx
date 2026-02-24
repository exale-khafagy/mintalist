"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const onboardingSchema = z.object({
  // Step 1: Business name and location
  name: z.string().min(2, "Business name is required"),
  locationName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  brandColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Invalid color"),
  // Step 2: Logo
  logoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  // Step 3: Links (JSON string for form)
  socialLinks: z.string().optional(),
  customLinks: z.string().optional(),
  // Step 4: Plan
  plan: z.enum(["SILVER", "GOLD", "PLATINUM"]).optional(),
  billingPeriod: z.enum(["MONTHLY", "ANNUAL"]).optional(),
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
      plan: "SILVER",
      billingPeriod: "MONTHLY",
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
    const { name, locationName, address, phone, brandColor } = form.getValues();
    const res = await fetch("/api/vendor/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || undefined,
        locationName: locationName || undefined,
        address: address || undefined,
        phone: phone || undefined,
        brandColor: brandColor || undefined,
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
    // Step 4: Plan
    if (step === 4) {
      const plan = form.getValues("plan");
      if (plan === "SILVER") {
        router.push("/dashboard");
        return;
      }
      if (plan === "GOLD" || plan === "PLATINUM") {
        setIsSubmitting(true);
        try {
          const tier = plan === "GOLD" ? "PAID_1" : "PAID_2";
          const period = form.getValues("billingPeriod") ?? "MONTHLY";
          const res = await fetch("/api/checkout/paymob", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tier, period }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error ?? "Failed to start payment");
          if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
            return;
          }
          setError("No redirect URL received");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
          setIsSubmitting(false);
        }
        return;
      }
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
  const plan = form.watch("plan");

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
                <label className="mb-1 block text-sm font-medium text-foreground">Location name (optional)</label>
                <Input
                  {...form.register("locationName")}
                  placeholder="e.g. Downtown"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Address (optional)</label>
                <Input
                  {...form.register("address")}
                  placeholder="Street, city"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Phone (optional)</label>
                <Input
                  {...form.register("phone")}
                  placeholder="+20..."
                  className="mt-1"
                />
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
            {isSubmitting ? "Saving..." : isLastStep && plan === "SILVER" ? "Go to dashboard" : isLastStep && (plan === "GOLD" || plan === "PLATINUM") ? "Continue to payment" : "Next"}{" "}
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

function OnboardingPlanStep({ form }: { form: ReturnType<typeof useForm<OnboardingValues>> }) {
  const plan = form.watch("plan");
  const period = form.watch("billingPeriod");

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {/* Silver */}
        <label
          className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 transition ${plan === "SILVER" ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20" : "border-border hover:border-muted-foreground/50"}`}
        >
          <input
            type="radio"
            name="plan"
            value="SILVER"
            checked={plan === "SILVER"}
            onChange={() => form.setValue("plan", "SILVER")}
            className="sr-only"
          />
          <span className="font-semibold text-foreground">Silver (Free)</span>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            <li>Digital menu on one link</li>
            <li>Random URL (e.g. mintalist.com/xy7k2m9a)</li>
            <li>QR code for your menu</li>
            <li>Powered by Mintalist badge</li>
          </ul>
        </label>

        {/* Gold */}
        <label
          className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 transition ${plan === "GOLD" ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20" : "border-border hover:border-muted-foreground/50"}`}
        >
          <input
            type="radio"
            name="plan"
            value="GOLD"
            checked={plan === "GOLD"}
            onChange={() => form.setValue("plan", "GOLD")}
            className="sr-only"
          />
          <span className="font-semibold text-foreground">Gold</span>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            <li>Everything in Silver</li>
            <li>Custom link (mintalist.com/your-cafe)</li>
            <li>Background image</li>
            <li>No ads</li>
          </ul>
          {plan === "GOLD" && (
            <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="radio"
                  name="goldPeriod"
                  checked={period === "MONTHLY"}
                  onChange={() => form.setValue("billingPeriod", "MONTHLY")}
                />
                <span>
                  100 LE / month – first 4 months 50% off.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="radio"
                  name="goldPeriod"
                  checked={period === "ANNUAL"}
                  onChange={() => form.setValue("billingPeriod", "ANNUAL")}
                />
                <span>
                  Annual: 600 LE for the first year, then 1000 LE / year on renewal.
                </span>
              </div>
            </div>
          )}
        </label>

        {/* Platinum */}
        <label
          className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 transition ${plan === "PLATINUM" ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20" : "border-border hover:border-muted-foreground/50"}`}
        >
          <input
            type="radio"
            name="plan"
            value="PLATINUM"
            checked={plan === "PLATINUM"}
            onChange={() => form.setValue("plan", "PLATINUM")}
            className="sr-only"
          />
          <span className="font-semibold text-foreground">Platinum</span>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            <li>Everything in Gold</li>
            <li>Your subdomain (yourcafe.mintalist.com)</li>
            <li>Priority support</li>
          </ul>
          {plan === "PLATINUM" && (
            <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="radio"
                  name="platinumPeriod"
                  checked={period === "MONTHLY"}
                  onChange={() => form.setValue("billingPeriod", "MONTHLY")}
                />
                <span>
                  150 LE / month – first 4 months at 75 LE.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="radio"
                  name="platinumPeriod"
                  checked={period === "ANNUAL"}
                  onChange={() => form.setValue("billingPeriod", "ANNUAL")}
                />
                <span>
                  Annual: 900 LE for the first year, then 1500 LE / year on renewal.
                </span>
              </div>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
