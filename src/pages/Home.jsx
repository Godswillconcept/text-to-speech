import { Link } from 'react-router-dom';
import { DocumentTextIcon, SpeakerWaveIcon, PencilIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Text to Speech',
    description: 'Convert any text into natural-sounding speech with multiple voice options.',
    icon: SpeakerWaveIcon,
    href: '/text-to-speech',
  },
  {
    name: 'PDF to Speech',
    description: 'Upload PDF documents and have them read aloud with high-quality text-to-speech.',
    icon: DocumentTextIcon,
    href: '/pdf-to-speech',
  },
  {
    name: 'Paraphrase',
    description: 'Rephrase your text while preserving the original meaning and context.',
    icon: PencilIcon,
    href: '/paraphrase',
  },
  {
    name: 'Summarize',
    description: 'Get concise summaries of long documents or articles in seconds.',
    icon: DocumentMagnifyingGlassIcon,
    href: '/summarize',
  },
];

const Home = () => {
  return (
    <div className="py-12">
      <div className="lg:text-center">
        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          A better way to work with text
        </p>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
          Transform your text with our powerful suite of tools designed to make your work easier and more efficient.
        </p>
      </div>

      <div className="mt-10">
        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
          {features.map((feature) => (
            <div key={feature.name} className="relative group">
              <Link to={feature.href} className="block p-6 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{feature.name}</h3>
                        <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                    </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          <span className="block">Ready to get started?</span>
          <span className="block text-indigo-600">Choose a tool to begin.</span>
        </h2>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <Link
              to="/text-to-speech"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Get started
            </Link>
          </div>
          <div className="ml-3 inline-flex">
            <Link
              to="/operations"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              View past operations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;