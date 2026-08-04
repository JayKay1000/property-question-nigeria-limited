import React from "react";

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium text-brand-900">{v || "—"}</span>
    </div>
  );
}

function Section({ title, data }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-ice-50 p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="space-y-1.5">
        {Object.entries(data).map(([k, v]) => (
          <Row key={k} k={k} v={v} />
        ))}
      </div>
    </div>
  );
}

export default function ReviewStep({ form, docs }) {
  const base = {
    "First name": form.firstName,
    "Last name": form.lastName,
    Email: form.email,
    Phone: form.phone,
    Country: form.country,
    State: form.state,
    City: form.city,
  };
  const sections = [{ title: "Personal", data: base }];

  if (form.accountType === "owner") {
    sections.push({
      title: "Property",
      data: {
        "Property type": form.propertyType,
        Location: form.propertyLocation,
        "Reason for listing": form.reasonForListing,
        "Preferred contact": form.preferredContact,
      },
    });
  }
  if (form.accountType === "corporate") {
    sections.push({
      title: "Company",
      data: { Company: form.companyName, "RC number": form.companyRegNumber, Role: form.contactRole },
    });
  }
  if (form.accountType === "agent") {
    sections.push({
      title: "Professional",
      data: { Occupation: form.occupation, Experience: form.yearsExperience, "Areas of operation": form.areasOfOperation, Languages: form.languages },
    });
    sections.push({
      title: "Banking",
      data: { "Account name": form.bankAccountName, "Account number": form.bankAccountNumber, Bank: form.bankName },
    });
    sections.push({ title: "Emergency Contact", data: { Name: form.emergencyName, Phone: form.emergencyPhone } });
    const docData = Object.fromEntries(
      Object.entries(docs).filter(([, u]) => u).map(([k]) => [k.replace(/_/g, " "), "✓ Uploaded"])
    );
    if (Object.keys(docData).length) sections.push({ title: "Documents", data: docData });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Please review your information before submitting.{" "}
        {form.accountType === "agent"
          ? "Your application will be reviewed by Property Question Nigeria Limited and you will receive an email once approved."
          : "You will receive an email verification code after submitting."}
      </p>
      {sections.map((s) => (
        <Section key={s.title} {...s} />
      ))}
    </div>
  );
}