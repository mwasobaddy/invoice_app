import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsForm from "@/components/SettingsForm";

export const metadata = {
  title: "Account Settings - Invoice Manager",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Fetch user with linked accounts
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { accounts: true },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const linkedProviders = user.accounts.map((acc) => ({
    provider: acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1),
    linkedAt: acc.createdAt ?? null,
  }));

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Profile</p>
        <h1 className="text-3xl font-semibold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-600">Manage your authentication methods and password.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 p-6">
        {/* Account Information Section */}
        <div className="border-b pb-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Account Information</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="text-base text-slate-900">{user.email}</dd>
            </div>
            {user.name && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Name</dt>
                <dd className="text-base text-slate-900">{user.name}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-slate-500">Member Since</dt>
              <dd className="text-base text-slate-900">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Linked Authentication Methods */}
        <div className="border-b pb-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Linked Authentication Methods</h3>
          {linkedProviders.length > 0 ? (
            <div className="space-y-3">
              {linkedProviders.map((provider) => (
                <div
                  key={provider.provider}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{provider.provider}</p>
                    <p className="text-sm text-slate-600">
                      {provider.linkedAt
                        ? `Connected on ${provider.linkedAt.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}`
                        : "Connected"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                    Connected
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">No authentication methods linked yet.</p>
          )}
        </div>

        {/* Password Section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Password</h3>
          <SettingsForm userEmail={user.email} hasPassword={!!user.password} />
        </div>
      </div>
    </div>
  );
}
