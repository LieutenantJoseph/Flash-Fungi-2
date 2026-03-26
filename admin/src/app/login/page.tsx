// admin/src/app/login/page.tsx
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}