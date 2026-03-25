import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import api from '../../api/axios';

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Smoke: auth context paths', () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('checks auth status through /auth/me on mount', async () => {
    api.get.mockResolvedValueOnce({ data: { data: null } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/auth/me');
  });

  it('uses /auth/login and updates user state', async () => {
    api.get.mockResolvedValueOnce({ data: { data: null } });
    api.post.mockResolvedValueOnce({ data: { user: { id: 'u-1' }, success: true } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login('demo@example.com', 'secret');
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'demo@example.com',
      password: 'secret',
    });
    expect(result.current.user).toEqual({ id: 'u-1' });
  });

  it('uses /auth/register for registration flow', async () => {
    api.get.mockResolvedValueOnce({ data: { data: null } });
    api.post.mockResolvedValueOnce({ data: { success: true } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'secret',
      });
    });

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'secret',
    });
  });

  it('uses /auth/logout and clears user state', async () => {
    api.get.mockResolvedValueOnce({ data: { data: null } });
    api.post.mockResolvedValueOnce({ data: { success: true } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(result.current.user).toBeNull();
  });
});
