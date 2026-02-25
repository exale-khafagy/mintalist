import { useState } from "react";

type Period = "MONTHLY" | "ANNUAL";

interface PeriodSelectorProps {
  onChange: (period: Period) => void;
  defaultPeriod?: Period;
}

export function PeriodSelector({ onChange, defaultPeriod = "MONTHLY" }: PeriodSelectorProps) {
  const [period, setPeriod] = useState<Period>(defaultPeriod);

  const handleChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    onChange(newPeriod);
  };

  return (
    <div className="flex items-center space-x-4">
      <label className="flex items-center">
        <input
          type="radio"
          name="period"
          value="MONTHLY"
          checked={period === "MONTHLY"}
          onChange={() => handleChange("MONTHLY")}
          className="mr-2"
        />
        Monthly
      </label>
      <label className="flex items-center">
        <input
          type="radio"
          name="period"
          value="ANNUAL"
          checked={period === "ANNUAL"}
          onChange={() => handleChange("ANNUAL")}
          className="mr-2"
        />
        Annual
      </label>
    </div>
  );
}