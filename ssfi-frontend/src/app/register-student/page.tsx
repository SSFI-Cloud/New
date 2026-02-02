'use client';

import StudentRegistrationForm from '@/components/forms/StudentRegistrationForm';

export default function RegisterStudentPage() {
    return (
        <main className="min-h-screen bg-dark-950 py-8">
            <div className="container mx-auto px-4">
                <StudentRegistrationForm />
            </div>
        </main>
    );
}
