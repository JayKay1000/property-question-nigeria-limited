import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmationScreen({ accountType, email }) {
  const isAgent = accountType === "agent";
  return (
    <div className="mx-auto max-w-md text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-success/10"
      >
        <CheckCircle2 className="h-10 w-10 text-success" />
      </motion.div>
      <h1 className="mt-5 font-heading text-2xl font-bold text-brand-900">
        {isAgent ? "Application Received" : "Account Created"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isAgent
          ? "Your agent application has been submitted successfully. Our team will review your documents and contact you within 3–7 business days."
          : "Your account has been created successfully. A verification code has been sent to your email — enter it to complete verification."}
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-1.5 text-sm font-medium text-warning">
        <Clock className="h-4 w-4" /> Status: {isAgent ? "Pending Verification" : "Email Verification Required"}
      </div>
      {email && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" /> {email}
        </div>
      )}
      <div className="mt-6 flex gap-3">
        <Button asChild className="flex-1 bg-flame-500 hover:bg-flame-600">
          <Link to="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 border-brand-200">
          <Link to="/login">Log in</Link>
        </Button>
      </div>
    </div>
  );
}