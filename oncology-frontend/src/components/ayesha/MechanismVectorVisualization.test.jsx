import { render, screen } from '@testing-library/react';
import MechanismVectorVisualization from './MechanismVectorVisualization';

describe('MechanismVectorVisualization (Manager Compliance)', () => {
    const mockVector = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]; // Valid 7D vector
    const mockMutations = [{ gene: 'TP53', variant: 'R175H' }];
    const mockProvenance = { run_id: 'TEST_RUN_123', version: '1.0' };

    test('renders correctly with valid mechanism vector and provenance', () => {
        render(
            <MechanismVectorVisualization
                mechanismVector={mockVector}
                mutations={mockMutations}
                provenance={mockProvenance}
            />
        );

        // Verify Title
        expect(screen.getByText(/Tumor Mechanism Drivers/i)).toBeInTheDocument();

        // Verify Pathways Rendered
        expect(screen.getByText('DNA Damage Response (DDR)')).toBeInTheDocument();
        expect(screen.getByText('Drug Efflux')).toBeInTheDocument();

        // Verify RUO-safe helper copy (no "vulnerability"/"eligible" claims)
        expect(
            screen.getByText(/Higher scores mean the model is emphasizing that pathway axis more in this run/i)
        ).toBeInTheDocument();

        // Verify Provenance Tooltip (Source text usually in tooltip, check existence)
        // Note: Tooltips might need user interaction to show text, but we can check if the element exists
        // For this test, we assume provenance logic renders *something* or doesn't crash.
    });

    test('renders "Mechanism Data Unavailable" when vector is missing', () => {
        render(<MechanismVectorVisualization mechanismVector={null} />);
        expect(screen.getByText(/Mechanism Data Unavailable/i)).toBeInTheDocument();
        expect(screen.getByText(/Missing canonical vector/i)).toBeInTheDocument();
    });

    test('renders "Mechanism Data Unavailable" when vector is invalid length', () => {
        render(<MechanismVectorVisualization mechanismVector={[0.1, 0.2]} />);
        expect(screen.getByText(/Mechanism Data Unavailable/i)).toBeInTheDocument();
    });

    test('shows "Estimated" badge when isEstimated is true', () => {
        render(
            <MechanismVectorVisualization
                mechanismVector={mockVector}
                isEstimated={true}
            />
        );
        expect(screen.getByText(/Estimated \(Germline\)/i)).toBeInTheDocument();
    });

    // Tripwire Test: Ensure no hardcoded default is used if prop is missing
    test('does NOT fall back to hardcoded default if prop is undefined', () => {
        render(<MechanismVectorVisualization />); // undefined prop
        // Should show error state, NOT the chart
        expect(screen.getByText(/Mechanism Data Unavailable/i)).toBeInTheDocument();
        // Should NOT show specific pathway values from the old hardcoded array
        // (Old hardcoded had DDR=0.88 -> 88%)
        expect(screen.queryByText('88%')).not.toBeInTheDocument();
    });
});
