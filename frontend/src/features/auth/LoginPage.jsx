export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-lg shadow-sm p-8">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">Sign in</h1>
      <p className="text-slate-500 text-sm mb-6">
        Google OAuth 2.0 will be integrated here. For development, use the header toggle
        &quot;Admin view&quot; and seeded users in the API.
      </p>
      <button
        type="button"
        disabled
        className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white opacity-60 cursor-not-allowed"
      >
        Continue with Google (coming soon)
      </button>
    </div>
  )
}
