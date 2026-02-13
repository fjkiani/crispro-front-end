import React from 'react';
import { formatDate } from '../../../utils/dateUtils'; // Assuming utility exists or I need to check where formatDate comes from

const PatientDemographicsTab = ({ demographics }) => {
    // Helper to safely format date if utility isn't available
    const safeFormatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };

    return (
        <section className="mb-6 p-4 bg-white rounded shadow">
            <h3 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p><strong>Name:</strong> {`${demographics.first_name || ''} ${demographics.last_name || ''}`.trim() || 'N/A'}</p>
                <p><strong>DOB:</strong> {safeFormatDate(demographics.dob)}</p>
                <p><strong>Sex:</strong> {demographics.gender || 'N/A'}</p>
                <p><strong>Contact:</strong> {demographics.contact || 'N/A'}</p>
                <p className="md:col-span-2"><strong>Address:</strong> {demographics.address || 'N/A'}</p>
                <p><strong>Race:</strong> {demographics.race || 'N/A'}</p>
                <p><strong>Ethnicity:</strong> {demographics.ethnicity || 'N/A'}</p>
                <p><strong>Insurance:</strong> {demographics.insurance || 'N/A'}</p>
            </div>
        </section>
    );
};

export default PatientDemographicsTab;
