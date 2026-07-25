"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import styles from "./auth.module.css";

type FieldName = "name" | "email" | "password" | "confirmPassword" | "acceptTerms" | "form";
type FieldErrors = Partial<Record<FieldName, string>>;
type ProviderAvailability = { google: boolean; facebook: boolean };

function passwordScore(password: string): number {
  return [
    password.length >= 10,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

export function SignUpForm({ providers }: { providers: ProviderAvailability }) {
  const router = useRouter();
  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const score = useMemo(() => passwordScore(fields.password), [fields.password]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        fields?: FieldErrors;
      };

      if (!response.ok) {
        setErrors({ ...data.fields, form: data.error ?? "Unable to create the account." });
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setErrors({ form: "The authentication service could not be reached." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <SocialAuthButtons providers={providers} nextPath="/admin" />

      {errors.form && (
        <div className={styles.formError} role="alert">
          <span aria-hidden="true">!</span>
          {errors.form}
        </div>
      )}

      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span>Full name</span>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon} aria-hidden="true">◇</span>
            <input
              type="text"
              value={fields.name}
              onChange={(event) => setFields((current) => ({ ...current, name: event.target.value }))}
              autoComplete="name"
              placeholder="Your full name"
              aria-invalid={Boolean(errors.name)}
              required
            />
          </div>
          {errors.name && <small className={styles.fieldError}>{errors.name}</small>}
        </label>

        <label className={styles.field}>
          <span>Work email</span>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon} aria-hidden="true">@</span>
            <input
              type="email"
              value={fields.email}
              onChange={(event) => setFields((current) => ({ ...current, email: event.target.value }))}
              autoComplete="email"
              placeholder="name@company.com"
              aria-invalid={Boolean(errors.email)}
              required
            />
          </div>
          {errors.email && <small className={styles.fieldError}>{errors.email}</small>}
        </label>
      </div>

      <label className={styles.field}>
        <span>Create password</span>
        <div className={styles.inputWrap}>
          <span className={styles.inputIcon} aria-hidden="true">●</span>
          <input
            type={showPassword ? "text" : "password"}
            value={fields.password}
            onChange={(event) => setFields((current) => ({ ...current, password: event.target.value }))}
            autoComplete="new-password"
            placeholder="At least 10 characters"
            aria-invalid={Boolean(errors.password)}
            required
          />
          <button
            className={styles.revealButton}
            type="button"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <div className={styles.strength} aria-label={`Password strength ${score} of 5`}>
          {[1, 2, 3, 4, 5].map((level) => (
            <span key={level} className={level <= score ? styles.strengthActive : ""} />
          ))}
        </div>
        <small className={errors.password ? styles.fieldError : styles.helpText}>
          {errors.password ?? "Use uppercase, lowercase, a number, and a symbol."}
        </small>
      </label>

      <label className={styles.field}>
        <span>Confirm password</span>
        <div className={styles.inputWrap}>
          <span className={styles.inputIcon} aria-hidden="true">●</span>
          <input
            type={showPassword ? "text" : "password"}
            value={fields.confirmPassword}
            onChange={(event) =>
              setFields((current) => ({ ...current, confirmPassword: event.target.value }))
            }
            autoComplete="new-password"
            placeholder="Repeat your password"
            aria-invalid={Boolean(errors.confirmPassword)}
            required
          />
        </div>
        {errors.confirmPassword && (
          <small className={styles.fieldError}>{errors.confirmPassword}</small>
        )}
      </label>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={fields.acceptTerms}
          onChange={(event) =>
            setFields((current) => ({ ...current, acceptTerms: event.target.checked }))
          }
        />
        <span>I agree to the administration access policy and acceptable-use terms.</span>
      </label>
      {errors.acceptTerms && <small className={styles.fieldError}>{errors.acceptTerms}</small>}

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        <span>{submitting ? "Creating secure account..." : "Create account"}</span>
        <span aria-hidden="true">→</span>
      </button>

      <p className={styles.switchText}>
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </form>
  );
}
