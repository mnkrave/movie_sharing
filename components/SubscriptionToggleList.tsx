"use client";

import React from "react";

interface SwitchRowProps {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  ariaLabel: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export function SwitchRow({
  checked,
  onToggle,
  disabled,
  ariaLabel,
  label,
  description,
  className = "",
}: SwitchRowProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 ${
          checked ? "bg-primary" : "bg-muted border border-border"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

interface SubscriptionOption {
  key: string;
  label: string;
  color: string;
}

interface SubscriptionToggleListProps {
  subscriptions: readonly SubscriptionOption[];
  selectedKeys: string[];
  onToggle: (key: string) => void;
  containerClassName?: string;
  rowClassName?: string;
}

export function SubscriptionToggleList({
  subscriptions,
  selectedKeys,
  onToggle,
  containerClassName = "space-y-3",
  rowClassName = "",
}: SubscriptionToggleListProps) {
  return (
    <div className={containerClassName}>
      {subscriptions.map((sub) => (
        <SwitchRow
          key={sub.key}
          checked={selectedKeys.includes(sub.key)}
          onToggle={() => onToggle(sub.key)}
          ariaLabel={`${sub.label} umschalten`}
          className={rowClassName}
          label={
            <span className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: sub.color }}
              />
              {sub.label}
            </span>
          }
        />
      ))}
    </div>
  );
}
