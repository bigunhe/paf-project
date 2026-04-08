import ReactMarkdown from 'react-markdown';
import rawReadme from '../../../README.md?raw';

export default function ReadmeViewer() {
  return (
    <div className="max-w-4xl mx-auto w-full bg-white border border-slate-200 rounded-lg shadow-sm p-8 md:p-12 mb-10">
      <div className="prose prose-slate prose-blue max-w-none">
        <ReactMarkdown>{rawReadme}</ReactMarkdown>
      </div>
    </div>
  );
}
