import React from 'react';
import { Lightbulb, Users, Award, Globe } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal'; // Import ScrollReveal

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-12">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            About SunilTextile.AI
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Revolutionizing textile design with artificial intelligence.
          </p>
        </ScrollReveal>

        <section className="mb-16">
          <ScrollReveal delay={200}>
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
              Our Mission
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-3xl mx-auto text-center border border-gray-200 dark:border-gray-700">
              <Lightbulb size={64} className="text-blue-600 dark:text-blue-400 mx-auto mb-6" />
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                At SunilTextile.AI, our mission is to empower textile designers, manufacturers, and fashion brands with cutting-edge AI technology. We aim to streamline the creative process, foster innovation, and bring unique, sustainable designs to life faster and more efficiently than ever before. We believe in a future where creativity knows no bounds, supported by intelligent tools.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="mb-16">
          <ScrollReveal delay={400}>
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
              Our Values
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ScrollReveal delay={500}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center border border-gray-200 dark:border-gray-700">
                <Users size={48} className="text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Collaboration</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We foster a collaborative environment, believing that the best designs emerge from shared ideas and diverse perspectives.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={600}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center border border-gray-200 dark:border-gray-700">
                <Award size={48} className="text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Innovation</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We are committed to continuous innovation, pushing the boundaries of what's possible in AI and design.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={700}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center border border-gray-200 dark:border-gray-700">
                <Globe size={48} className="text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Sustainability</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We strive to promote sustainable practices in textile production through efficient design processes.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section>
          <ScrollReveal delay={800}>
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
              Our Story
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={900}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-3xl mx-auto text-center border border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Founded in 2023 by a team of passionate textile experts and AI engineers, SunilTextile.AI emerged from a shared vision: to bridge the gap between traditional craftsmanship and modern technology. We saw the potential of AI to not replace, but augment human creativity, offering tools that inspire new forms, textures, and patterns. Our journey began with extensive research and development, collaborating with leading designers to build a platform that truly understands the nuances of textile art. Today, we are proud to be at the forefront of this exciting revolution, helping our users create stunning, innovative designs that captivate and inspire.
              </p>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
};

export default About;
