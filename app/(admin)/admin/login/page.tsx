import { LoginForm } from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-2xl font-semibold">تسجيل الدخول</h1>
      <p className="mt-2 text-sm text-gray-700">لوحة تحكم JTECH — للمشرف فقط.</p>
      <LoginForm />
    </div>
  );
}
