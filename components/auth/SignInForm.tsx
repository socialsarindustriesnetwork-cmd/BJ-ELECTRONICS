"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./auth.module.css";

type FieldErrors = Partial<Record<"email" | "password" | "form", string>>;

export function SignInForm({ nextPath = "/admin" }: { nextPath?: string }) {
  const router = useRouter();
  const [fields, setFields] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        fields?: FieldErrors;
      };

      if (!response.ok) {
        setErrors({ ...data.fields, form: data.error ?? "Unable to sign in." });
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setErrors({ form: "The authentication service could not be reached." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {errors.form && (
        <div className={styles.formError} role="alert">
          <span aria-hidden="true">!</span>
          {errors.form}
        </div>
      )}

      <label className={styles.field}>
        <span>Email address</span>
        <div className={styles.inputWrap}>
          <span className={styles.inputIcon} aria-hidden="true">@</span>
          <input
            type="email"
            name="email"
            value={fields.email}
            onChange={(event) => setFields((current) => ({ ...current, email: event.target.value }))}
            autoComplete="email"
            placeholder="admin@bjelectronics.shop"
            aria-invalid={Boolean(errors.email)}
            required
          />
        </div>
        {errors.email && <small className={styles.fieldError}>{errors.email}</small>}
      </label>

      <label className={styles.field}>
        <span>Password</span>
        <div className={styles.inputWrap}>
          <span className={styles.inputIcon} aria-hidden="true">●</span>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={fields.password}
            onChange={(event) => setFields((current) => ({ ...current, password: event.target.value }))}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            required
          />
          <button
            className={styles.revealButton}
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && <small className={styles.fieldError}>{errors.password}</small>}
      </label>

      <div className={styles.formOptions}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={fields.remember}
            onChange={(event) =>
              setFields((current) => ({ ...current, remember: event.target.checked }))
            }
          />
          <span>Keep me signed in</span>
        </label>
        <span className={styles.mutedLink} title="Password recovery will be enabled with email delivery.">
          Forgot password?
        </span>
      </div>

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        <span>{submitting ? "Verifying access..." : "Sign in securely"}</span>
        <span aria-hidden="true">→</span>
      </button>

      <p className={styles.switchText}>
        New to the administration portal? <Link href="/sign-up">Create an account</Link>
      </p>
    </form>
  );
}
