import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: December 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-card rounded-lg shadow-sm p-8 prose dark:prose-invert max-w-none">
          <h2>Educational Purpose</h2>
          <p>
            AIStarter School is an educational platform designed to teach artificial intelligence concepts 
            to students in grades 6-12. Our mission is to provide age-appropriate, comprehensive AI 
            education that prepares students for the future while maintaining the highest standards 
            of safety and educational value.
          </p>

          <h2>Age Rules</h2>
          <p>
            This platform is specifically designed for students ages 11-18 (grades 6-12). Users under 
            13 must have parental consent to create an account. Parents and guardians are encouraged 
            to participate in their child's learning journey and monitor their progress on the platform.
          </p>
          <ul>
            <li>Students ages 11-12 require parental supervision and consent</li>
            <li>Students ages 13-17 may use the platform with parental awareness</li>
            <li>Students 18+ may use the platform independently</li>
          </ul>

          <h2>Account Rules</h2>
          <p>
            Users are responsible for maintaining the security of their accounts and are fully 
            responsible for all activities that occur under their account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information when creating your account</li>
            <li>Keep your login credentials secure and not share them with others</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Use only one account per student</li>
            <li>Not create accounts for anyone else without permission</li>
          </ul>

          <h2>Acceptable Use</h2>
          <p>
            AIStarter School is committed to providing a safe, respectful learning environment. 
            Users agree to:
          </p>
          <ul>
            <li>Use the platform solely for educational purposes</li>
            <li>Treat all community members with respect and kindness</li>
            <li>Not attempt to circumvent safety measures or content filters</li>
            <li>Not use the platform to create, share, or promote harmful, offensive, or inappropriate content</li>
            <li>Not attempt to hack, disrupt, or damage the platform or other users' experiences</li>
            <li>Follow all applicable laws and regulations</li>
            <li>Report any inappropriate behavior or content to our moderation team</li>
          </ul>

          <h2>Content and Copyright</h2>
          <p>
            Students retain ownership of original content they create on the platform. However, 
            by using AIStarter School, you grant us a license to use, display, and distribute 
            student work for educational and promotional purposes, always with appropriate 
            attribution and privacy protections.
          </p>
          <p>
            All course materials, lesson content, and platform features are the intellectual 
            property of AIStarter School and are protected by copyright law. Users may not 
            reproduce, distribute, or create derivative works from our content without 
            written permission.
          </p>

          <h2>Platform Availability</h2>
          <p>
            While we strive to maintain 24/7 availability, AIStarter School reserves the right 
            to modify, suspend, or discontinue any part of the service at any time. We may 
            perform maintenance that temporarily limits access to certain features.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            AIStarter School provides educational content and tools "as is" without warranties 
            of any kind. While we implement robust safety measures, users are responsible for 
            their own learning outcomes and the appropriate use of AI knowledge gained through 
            our platform.
          </p>

          <h2>Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at:
            <br />
            Email: support@aistarterschool.com
            <br />
            Subject: Terms of Service Inquiry
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these Terms of Service periodically. Users will be notified of 
            significant changes via email or platform notifications. Continued use of the 
            platform after changes indicates acceptance of the new terms.
          </p>
        </div>
      </div>
    </div>
  );
}