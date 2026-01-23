/**
 * Basic tests for S/P/E Insights hooks
 * Testing: schema guards, error handling, caching behavior
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInsightsBundle, useFunctionalityChange } from '../useInsights';

// Mock fetch globally
global.fetch = vi.fn();

describe('useInsights hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('useFunctionalityChange', () => {
    it('should return loading state initially', () => {
      const { result } = renderHook(() => 
        useFunctionalityChange({ gene: 'BRAF', hgvs_p: 'p.V600E' })
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should handle missing required params gracefully', () => {
      const { result } = renderHook(() => 
        useFunctionalityChange({ gene: null, hgvs_p: null })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should return data with correct schema on success', async () => {
      const mockResponse = {
        functionality_score: 0.85,
        confidence: 0.9,
        rationale: ['Domain disruption detected'],
        provenance: { method: 'evo2_delta', run_id: 'test-123' }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { result } = renderHook(() => 
        useFunctionalityChange({ gene: 'BRAF', hgvs_p: 'p.V600E' })
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toEqual({
        score: 0.85,
        confidence: 0.9,
        rationale: ['Domain disruption detected'],
        provenance: { method: 'evo2_delta', run_id: 'test-123' }
      });
      expect(result.current.error).toBe(null);
    });

    it('should handle API errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => 
        useFunctionalityChange({ gene: 'BRAF', hgvs_p: 'p.V600E' })
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('useInsightsBundle', () => {
    it('should fetch all insights in parallel', async () => {
      const mockResponses = {
        functionality: { functionality_score: 0.85, provenance: {} },
        chromatin: { chromatin_score: 0.72, provenance: {} },
        essentiality: { essentiality_score: 0.91, provenance: {} },
        regulatory: { regulatory_impact_score: 0.45, provenance: {} }
      };

      global.fetch.mockImplementation((url) => {
        if (url.includes('functionality')) {
          return Promise.resolve({ ok: true, json: async () => mockResponses.functionality });
        }
        if (url.includes('chromatin')) {
          return Promise.resolve({ ok: true, json: async () => mockResponses.chromatin });
        }
        if (url.includes('essentiality')) {
          return Promise.resolve({ ok: true, json: async () => mockResponses.essentiality });
        }
        if (url.includes('regulatory')) {
          return Promise.resolve({ ok: true, json: async () => mockResponses.regulatory });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      const { result } = renderHook(() => 
        useInsightsBundle({
          gene: 'BRAF',
          hgvs_p: 'p.V600E',
          coords: { chrom: '7', pos: 140453136, ref: 'T', alt: 'A' }
        })
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.functionality).toBeDefined();
      expect(result.current.chromatin).toBeDefined();
      expect(result.current.essentiality).toBeDefined();
      expect(result.current.regulatory).toBeDefined();
      expect(result.current.error).toBe(false);
    });

    it('should use cached results on subsequent calls', async () => {
      const mockResponse = { functionality_score: 0.85, provenance: {} };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const params = { gene: 'BRAF', hgvs_p: 'p.V600E' };

      // First render
      const { result: result1 } = renderHook(() => useFunctionalityChange(params));
      await waitFor(() => expect(result1.current.loading).toBe(false));

      const firstCallCount = global.fetch.mock.calls.length;

      // Second render with same params
      const { result: result2 } = renderHook(() => useFunctionalityChange(params));
      await waitFor(() => expect(result2.current.loading).toBe(false));

      // Should use cache, no additional fetch calls
      expect(global.fetch.mock.calls.length).toBe(firstCallCount);
      expect(result2.current.data).toEqual(result1.current.data);
    });
  });

  describe('Schema guards', () => {
    it('should handle missing score fields gracefully', async () => {
      const malformedResponse = {
        // Missing functionality_score
        confidence: 0.9,
        provenance: {}
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => malformedResponse
      });

      const { result } = renderHook(() => 
        useFunctionalityChange({ gene: 'BRAF', hgvs_p: 'p.V600E' })
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Should handle gracefully with fallback
      expect(result.current.data?.score).toBeUndefined();
      expect(result.current.data?.confidence).toBe(0.9);
    });
  });
});


