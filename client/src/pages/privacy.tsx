import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';

export default function Privacy() {
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
            Privacy & Data Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: December 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-card rounded-lg shadow-sm p-8 prose dark:prose-invert max-w-none">
          <h2>What Data We Collect</h2>
          <p>
            AIStarter School collects minimal data necessary to provide educational services and 
            ensure student safety. We collect:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Student name, email address, grade level, and school (if provided)</li>
            <li><strong>Learning Activity:</strong> Lesson progress, quiz scores, project submissions, and time spent learning</li>
            <li><strong>AI Interactions:</strong> Conversations with AI teachers for educational improvement and safety monitoring</li>
            <li><strong>Usage Data:</strong> Login times, feature usage, and navigation patterns to improve the platform</li>
            <li><strong>Safety Logs:</strong> Content flagged by our safety systems for moderation review</li>
          </ul>
          <p>
            We do not collect sensitive personal information, financial data, or information 
            unrelated to educational activities.
          </p>

          <h2>Where Data Is Stored</h2>
          <p>
            All student data is securely stored using Firebase, Google's cloud infrastructure 
            platform. Our data storage practices include:
          </p>
          <ul>
            <li>Data centers located in the United States with enterprise-grade security</li>
            <li>Encryption of data both in transit and at rest</li>
            <li>Regular security audits and compliance monitoring</li>
            <li>Automatic backups to prevent data loss</li>
            <li>Access controls limiting who can view student information</li>
          </ul>

          <h2>Who Can Access Student Data</h2>
          <p>
            Access to student data is strictly limited to authorized AIStarter School staff 
            who need it for educational or safety purposes:
          </p>
          <ul>
            <li><strong>Educational Team:</strong> Curriculum developers and AI teachers (automated systems)</li>
            <li><strong>Safety Team:</strong> Moderators who review flagged content for student protection</li>
            <li><strong>Technical Team:</strong> Engineers who maintain the platform and resolve technical issues</li>
            <li><strong>Parents/Guardians:</strong> May request access to their child's learning progress and activity</li>
          </ul>
          <p>
            We never sell student data to third parties or use it for advertising purposes. 
            Student information is used solely to provide educational services and ensure 
            a safe learning environment.
          </p>

          <h2>How We Protect Student Privacy</h2>
          <p>
            Student privacy is our top priority. Our protection measures include:
          </p>
          <ul>
            <li>Age-appropriate content filtering and safety monitoring</li>
            <li>Anonymization of data for research and platform improvement</li>
            <li>Minimal data collection - we only gather what's necessary for education</li>
            <li>Regular deletion of unnecessary logs and temporary data</li>
            <li>Staff training on student privacy and data protection</li>
            <li>Compliance with COPPA and other student privacy regulations</li>
          </ul>

          <h2>Student Rights</h2>
          <p>
            Students and their parents/guardians have the right to:
          </p>
          <ul>
            <li>Access their personal data and learning records</li>
            <li>Request corrections to inaccurate information</li>
            <li>Request deletion of their account and associated data</li>
            <li>Opt out of optional data collection features</li>
            <li>Receive copies of their data in a portable format</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            We retain student data only as long as necessary for educational purposes:
          </p>
          <ul>
            <li>Active accounts: Data retained while account is in use</li>
            <li>Inactive accounts: Data automatically deleted after 2 years of inactivity</li>
            <li>Safety logs: Retained for 1 year for security and moderation purposes</li>
            <li>Anonymized research data: May be retained indefinitely for educational research</li>
          </ul>

          <h2>Sharing of Information</h2>
          <p>
            We do not share personal student information except in these limited circumstances:
          </p>
          <ul>
            <li>With parents/guardians upon request</li>
            <li>With schools when students access the platform through their educational institution</li>
            <li>When required by law or to protect student safety</li>
            <li>With service providers who help operate the platform (under strict data protection agreements)</li>
          </ul>

          <h2>Cookies and Tracking</h2>
          <p>
            We use minimal cookies and tracking technologies:
          </p>
          <ul>
            <li>Essential cookies for login and platform functionality</li>
            <li>Analytics cookies to understand how students use the platform (anonymized)</li>
            <li>No advertising or social media tracking cookies</li>
          </ul>

          <h2>Changes to Privacy Policy</h2>
          <p>
            We may update this privacy policy to reflect changes in our practices or legal 
            requirements. Students and parents will be notified of significant changes via 
            email and platform notifications.
          </p>

          <h2>Contact Us</h2>
          <p>
            For questions about privacy, data access, or our data practices, please contact:
            <br />
            Email: privacy@aistarterschool.com
            <br />
            Subject: Privacy Policy Inquiry
          </p>

          {/* Data Deletion Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Account and Data Deletion
            </h2>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              To delete your account and all associated data, please email:
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 border">
              <p className="font-mono text-sm">
                <strong>Email:</strong> support@aistarterschool.com<br />
                <strong>Subject:</strong> DATA DELETION
              </p>
            </div>
            <p className="text-blue-800 dark:text-blue-200 mt-4 text-sm">
              Include your account email address and we will permanently delete all your data within 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}