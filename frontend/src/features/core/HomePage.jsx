import { useState } from 'react'
import { Link } from 'react-router-dom'
import { OAUTH_GOOGLE_URL } from './constants'

const highlights = [
  {
    title: 'Find and book campus resources',
    desc: 'Browse rooms, labs, and equipment in one place.',
  },
  {
    title: 'Track bookings and approvals',
    desc: 'Students request slots, staff review and approve quickly.',
  },
  {
    title: 'Report incidents and stay updated',
    desc: 'Submit issues, follow status, and receive alert updates.',
  },
]

const faqItems = [
  {
    q: 'How do I sign in to Smart Campus Hub?',
    a: 'Use the "Sign in with Google" button and authenticate with your campus Google account.',
  },
  {
    q: 'Why am I asked to complete my profile after sign-in?',
    a: 'Your profile is required for routing, approvals, and contact visibility. Access to app features starts after profile completion.',
  },
  {
    q: 'How does a booking request get approved?',
    a: 'Submit your request from My Bookings. Approval behavior depends on user type and policy checks for availability.',
  },
  {
    q: 'Do lecturers, students, and staff have the same booking flow?',
    a: 'The same interface is used, but backend rules can apply different approval behavior based on user type.',
  },
  {
    q: 'How do I report a facility or safety issue?',
    a: 'Go to Report issue, select the relevant context, and submit details so facilities staff can track and resolve it.',
  },
  {
    q: 'Where can I track my booking and issue status?',
    a: 'Use the dashboard cards for My Bookings and Report issue to review current requests and progress.',
  },
  {
    q: 'Where do I manage my account details?',
    a: 'Open My Account from the top navigation to update profile details or manage account actions.',
  },
  {
    q: 'How do notifications work?',
    a: 'Use the Alerts dropdown in the header after sign-in. It shows booking and incident updates for your account.',
  },
  {
    q: 'Who can access the staff portal?',
    a: 'Only users with ADMIN role can access staff routes and operations tools.',
  },
  {
    q: 'What should I do if I cannot access a feature?',
    a: 'Check your sign-in status, role, and profile completion. If the issue persists, contact your campus operations/admin team.',
  },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className="space-y-14">
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-10">
        <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase mb-3">Smart Campus Hub</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight">
          One portal for campus spaces, requests, and operations
        </h1>
        <p className="text-slate-500 mt-4 max-w-2xl">
          Manage campus operations with a single system for facilities, booking requests, incident reporting, and
          notification updates. Students and staff use the same platform with role-appropriate dashboards.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={OAUTH_GOOGLE_URL}
            className="inline-flex bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 text-sm font-medium"
          >
            Sign in with Google
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-5">What you can do</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-base font-medium text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Frequently asked questions</h2>
        <p className="text-slate-500 text-sm mb-5">
          Essential guidance for sign-in, bookings, approvals, reporting, and account access.
        </p>
        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx
            return (
              <article key={item.q} className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <button
                  type="button"
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-slate-900">{item.q}</span>
                  <span className="text-slate-400 text-lg leading-none">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-500">{item.a}</p>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <footer className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Smart Campus Hub</h3>
            <p className="text-sm text-slate-500 mt-2">
              One portal for campus resource booking, incident reporting, and operational updates.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Quick links</h3>
            <div className="mt-2 space-y-1 text-sm">
              <Link to="/login" className="block text-blue-600 hover:underline">
                Sign in
              </Link>
              <Link to="/app/resources" className="block text-blue-600 hover:underline">
                Browse resources
              </Link>
              <Link to="/app/report" className="block text-blue-600 hover:underline">
                Report issue
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Guidelines</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-500">
              <li>Use campus-approved accounts only.</li>
              <li>Submit accurate details for faster processing.</li>
              <li>Follow booking and reporting policies.</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Smart Campus Hub. All rights reserved.</span>
          <span>Campus operations support</span>
        </div>
      </footer>
    </div>
  )
}
