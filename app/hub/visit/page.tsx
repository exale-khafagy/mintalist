"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TIER_OPTIONS = [
  { value: "FREE", label: "Silver (Free)" },
  { value: "PAID_1", label: "Gold" },
  { value: "PAID_2", label: "Platinum" },
] as const;

const STEPS = ["Employee Details", "Vendor Details", "Agreement"];

export default function HubVendorVisitPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeEmail: "",
    businessName: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
    locationName: "",
    agreedTier: "",
    notes: "",
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/hub/vendor-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? "Failed to save visit");
        return;
      }

      setSuccess(true);
      setFormData({
        employeeName: "",
        employeeEmail: "",
        businessName: "",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        address: "",
        locationName: "",
        agreedTier: "",
        notes: "",
      });
      setCurrentStep(0);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
          <CardHeader>
            <CardTitle className="text-emerald-800 dark:text-emerald-200">Visit recorded</CardTitle>
            <CardDescription>
              The vendor lead has been saved. You can add another visit below or go back to the Hub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => setSuccess(false)}
              className="border-emerald-300 dark:border-emerald-700"
            >
              Add another visit
            </Button>
          </CardContent>
        </Card>
        <VendorVisitForm
          currentStep={currentStep}
          formData={formData}
          onChange={handleChange}
          onNext={handleNext}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <VendorVisitForm
        currentStep={currentStep}
        formData={formData}
        onChange={handleChange}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </div>
  );
}

function VendorVisitForm({
  currentStep,
  formData,
  onChange,
  onNext,
  onPrev,
  onSubmit,
  loading,
  error,
}: {
  currentStep: number;
  formData: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string | null;
}) {
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="employeeName" className="mb-1 block text-xs text-zinc-500">
                Your name *
              </label>
              <Input
                id="employeeName"
                name="employeeName"
                value={formData.employeeName}
                onChange={onChange}
                required
                placeholder="e.g. Ahmed Hassan"
              />
            </div>
            <div>
              <label htmlFor="employeeEmail" className="mb-1 block text-xs text-zinc-500">
                Your email *
              </label>
              <Input
                id="employeeEmail"
                name="employeeEmail"
                type="email"
                value={formData.employeeEmail}
                onChange={onChange}
                required
                placeholder="you@mintalist.com"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="businessName" className="mb-1 block text-xs text-zinc-500">
                Business name *
              </label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={onChange}
                required
                placeholder="e.g. Cairo Coffee House"
              />
            </div>
            <div>
              <label htmlFor="contactName" className="mb-1 block text-xs text-zinc-500">
                Contact person name *
              </label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={onChange}
                required
                placeholder="e.g. Mohamed Ali"
              />
            </div>
            <div>
              <label htmlFor="contactPhone" className="mb-1 block text-xs text-zinc-500">
                Contact phone *
              </label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={onChange}
                required
                placeholder="e.g. 01234567890"
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="mb-1 block text-xs text-zinc-500">
                Contact email (optional)
              </label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={onChange}
                placeholder="owner@cairo-coffee.com"
              />
            </div>
            <div>
              <label htmlFor="address" className="mb-1 block text-xs text-zinc-500">
                Address (optional)
              </label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={onChange}
                placeholder="Street, city"
              />
            </div>
            <div>
              <label htmlFor="locationName" className="mb-1 block text-xs text-zinc-500">
                Location name (optional)
              </label>
              <Input
                id="locationName"
                name="locationName"
                value={formData.locationName}
                onChange={onChange}
                placeholder="e.g. Downtown branch"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="agreedTier" className="mb-1 block text-xs text-zinc-500">
                Agreed tier *
              </label>
              <select
                id="agreedTier"
                name="agreedTier"
                value={formData.agreedTier}
                onChange={onChange}
                required
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select tier</option>
                {TIER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="mb-1 block text-xs text-zinc-500">
                Notes from the visit (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={onChange}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring"
                placeholder="Follow-up, special requests, etc."
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor visit</CardTitle>
        <CardDescription>
          After a successful visit, fill this form to register the vendor lead. They can be onboarded once they sign up.
        </CardDescription>
        <div className="flex space-x-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`flex-1 rounded px-2 py-1 text-center text-sm ${
                index <= currentStep ? "bg-emerald-200 text-emerald-800" : "bg-zinc-200 text-zinc-600"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={currentStep === STEPS.length - 1 ? onSubmit : (e) => { e.preventDefault(); onNext(); }} className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">{STEPS[currentStep]}</h3>
            {renderStep()}
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="flex justify-between">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={onPrev}>
                Previous
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 ml-auto"
            >
              {currentStep === STEPS.length - 1 ? (loading ? "Saving…" : "Save vendor visit") : "Next"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
