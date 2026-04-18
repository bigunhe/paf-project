import ReactMarkdown from 'react-markdown';
import rawReadme from '../../../README.md?raw';
import PageHero from './PageHero';

export default function ReadmeViewer() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full mb-10">
      <PageHero
        eyebrow="Documentation"
        title="Project readme"
        description="Architecture, setup, and API notes from the repository README."
      />
    <div className="w-full bg-white border border-slate-200 rounded-lg shadow-sm p-8 md:p-12">
      <div className="prose prose-slate prose-blue max-w-none">
        <ReactMarkdown>{rawReadme}</ReactMarkdown>
      </div>
    </div>
    </div>
  );
}
