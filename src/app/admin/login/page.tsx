import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/admin" } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="card w-full max-w-sm p-8">
        <p className="font-serif text-2xl text-ink">Admin sign in</p>
        <p className="mb-6 mt-1 text-sm text-muted">Manage menu, bookings and messages.</p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
