// app/mateen/page.tsx
import type { Metadata } from 'next';
import { Github, Linkedin, Instagram, Music, Mail, Code, Database, Server, Palette, Lightbulb, PenTool, Megaphone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Mateen Ahmed - Full Stack Developer & Designer",
  description: "Mateen Ahmed is a full-stack developer and designer specializing in Angular, Node.js, MongoDB, Python, React Native, and creative problem-solving.",
  keywords: ["Mateen Ahmed", "Web Developer", "Full Stack Developer", "Angular", "Node.js", "MongoDB", "React Native", "Software Engineer", "Designer", "UI/UX"],
  authors: [{ name: "Mateen Ahmed" }],
  openGraph: {
    title: "Mateen Ahmed - Full Stack Developer & Designer",
    description: "Passionate software engineer specializing in Angular, Node.js, MongoDB, and React Native.",
    url: "https://toolteeno.com/mateen",
    type: "profile",
  },
  alternates: {
    canonical: "https://toolteeno.com/mateen",
  },
};

const technicalSkills = [
    { name: 'Angular', Icon: Code, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
    { name: 'MongoDB', Icon: Database, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
    { name: 'Node.js', Icon: Server, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
    { name: 'Python', Icon: Code, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
    { name: 'React Native', Icon: Code, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
    { name: 'SQL', Icon: Database, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
    { name: 'NestJS', Icon: Server, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-plain.svg' },
    { name: 'GitHub', Icon: Github, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
    { name: 'Linode', Icon: Server, logo: 'https://www.vectorlogo.zone/logos/linode/linode-icon.svg' },
    { name: 'Digital Ocean', Icon: Server, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/digitalocean/digitalocean-original.svg' },
    { name: 'AWS', Icon: Server, logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg' },
];

const creativeSkills = [
  { name: 'Design', Icon: Palette },
  { name: 'UI/UX', Icon: PenTool },
  { name: 'Branding', Icon: Megaphone },
  { name: 'Idea Generation', Icon: Lightbulb },
];

const socialLinks = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/ma3ahmed/', Icon: Linkedin, color: 'hover:text-blue-600 dark:hover:text-blue-400' },
  { name: 'GitHub', url: 'https://github.com/mateenahmedintwish', Icon: Github, color: 'hover:text-gray-900 dark:hover:text-white' },
  { name: 'Instagram', url: 'https://www.instagram.com/mateenaurteen/', Icon: Instagram, color: 'hover:text-pink-600 dark:hover:text-pink-400' },
  { name: 'Spotify', url: 'https://open.spotify.com/artist/7mJWsvTyIEf2zSE1E1qZHl', Icon: Music, color: 'hover:text-green-600 dark:hover:text-green-400' },
];

export default function MateenPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Mateen Ahmed',
            jobTitle: 'Full Stack Developer & Designer',
            url: 'https://toolteeno.com/mateen',
            sameAs: [
              'https://www.linkedin.com/in/ma3ahmed/',
              'https://github.com/mateenahmedintwish',
              'https://www.instagram.com/mateenaurteen/',
              'https://open.spotify.com/artist/7mJWsvTyIEf2zSE1E1qZHl',
            ],
          }),
        }}
      />

      <div className="w-full">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 rounded-2xl overflow-hidden text-white shadow-2xl">
            <div className="flex flex-col md:flex-row">
              {/* Left: Image - Full height, corner to corner */}
              <div className="w-full md:w-1/3 relative aspect-square md:aspect-auto">
                <Image 
                  src="/img/profile.jpg" 
                  alt="Mateen Ahmed" 
                  fill
                  className="object-cover object-top" 
                  priority 
                />
              </div>
              
              {/* Right: Details */}
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                  Mateen Ahmed
                </h1>
                <p className="text-xl md:text-2xl mb-6 text-indigo-100">
                  Full Stack Developer & Designer | CTO at Intwish
                </p>
                <p className="text-lg text-indigo-50 leading-relaxed mb-4">
                  Hey, I'm Mateen! With <span className="font-bold">15+ years of experience</span> in software development and design, 
                  I'm a programmer and designer with a knack for creative problem-solving.
                </p>
                <p className="text-lg text-indigo-50 leading-relaxed">
                  As CTO of <span className="font-bold">Intwish</span>, a successful gamification and AI solutions company, 
                  I've helped transform businesses through innovative technology. I love tackling complex challenges, 
                  staying happy, and throwing in a good pun whenever I can.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Skills Section */}
        <section className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-xl transition-colors duration-300">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
              <Code className="inline-block mr-2 mb-1" size={32} />
              Technical Skills
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {technicalSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center aspect-square p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                    <img src={skill.logo} alt={skill.name} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    {skill.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creative Skills Section */}
        <section className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-xl transition-colors duration-300">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
              <Palette className="inline-block mr-2 mb-1" size={32} />
              Creative Skills
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {creativeSkills.map((skill, index) => {
                const Icon = skill.Icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center aspect-square p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="mb-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                      <Icon size={48} />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                      {skill.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Services I Offer
              </h2>
              <p className="text-lg text-indigo-50 mb-10 leading-relaxed">
                With 15+ years of experience leading technology initiatives at Intwish, I offer expert consultation 
                services to help your company leverage cutting-edge technology solutions.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Server className="w-6 h-6" />
                    Technical Consulting
                  </h3>
                  <ul className="space-y-2 text-indigo-50">
                    <li>• Full-stack development architecture</li>
                    <li>• AI & Machine Learning solutions</li>
                    <li>• Cloud infrastructure & DevOps</li>
                    <li>• Technical team leadership</li>
                  </ul>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Palette className="w-6 h-6" />
                    Product & Design
                  </h3>
                  <ul className="space-y-2 text-indigo-50">
                    <li>• Gamification strategies</li>
                    <li>• UI/UX design & optimization</li>
                    <li>• Product roadmap planning</li>
                    <li>• Brand identity development</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-3">
                  🎯 Free Initial Consultation
                </h3>
                <p className="text-lg text-indigo-50 mb-6">
                  Let's discuss your ideas and explore the right direction for your company. 
                  Book a complimentary first consultation to discover how technology can transform your business.
                </p>
                <a
                  href="mailto:ma3ahmed@gmail.com?subject=Consultation Request - Let's Discuss Your Project"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <Mail size={24} />
                  <span>Book Free Consultation</span>
                </a>
              </div>

              <p className="text-sm text-indigo-100">
                Trusted by startups and established companies to deliver innovative solutions
              </p>
            </div>
          </div>
        </section>

        {/* Social & Contact Section */}
        <section className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-xl transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
              {/* Follow Me */}
              <div className="mb-10">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                  Follow Me
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {socialLinks.map((social, index) => {
                    const Icon = social.Icon;
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center justify-center aspect-square p-6 rounded-xl bg-gray-50 dark:bg-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group ${social.color}`}
                        aria-label={`${social.name} Profile`}
                      >
                        <Icon size={48} className="mb-3 text-gray-700 dark:text-gray-300 group-hover:text-current transition-colors" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-current text-center">
                          {social.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Get In Touch */}
              <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Get In Touch
                </h3>
                <a
                  href="mailto:ma3ahmed@gmail.com"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  aria-label="Send Email"
                >
                  <Mail size={24} />
                  <span>ma3ahmed@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Back Navigation */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
