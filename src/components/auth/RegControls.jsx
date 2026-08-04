import React from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Field({ label, value, onChange, placeholder, type = "text", required, icon: Icon, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <Label className="mb-1.5 block text-sm text-brand-900">
          {label} {required && <span className="text-error">*</span>}
        </Label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
        <Input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-11 bg-ice-50 ${Icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}

export function SelectField({ label, value, onValueChange, options, placeholder, required, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <Label className="mb-1.5 block text-sm text-brand-900">
          {label} {required && <span className="text-error">*</span>}
        </Label>
      )}
      <Select value={value || "__none__"} onValueChange={(v) => onValueChange(v === "__none__" ? "" : v)}>
        <SelectTrigger className="h-11 bg-ice-50">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CheckRow({ id, label, checked, onChange, link, linkTo }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-brand-100 p-3">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
      <Label htmlFor={id} className="text-sm font-normal cursor-pointer">
        {link && linkTo ? (
          <>
            {label}
            <Link to={linkTo} className="font-medium text-flame-600 hover:underline">{link}</Link>
          </>
        ) : label}
      </Label>
    </div>
  );
}