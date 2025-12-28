import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RegisterPage from './page';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

jest.mock('next/navigation');
jest.mock('@/lib/api');
jest.mock('@/store/authStore');

const mockRouter = {
  push: jest.fn(),
};

const mockSetAuth = jest.fn();

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  (useAuthStore as unknown as jest.Mock).mockReturnValue({
    setAuth: mockSetAuth,
  });
  (api.post as jest.Mock).mockResolvedValue({
    data: {
      user: { id: '1', email: 'test@example.com' },
      token: 'token',
    },
  });
});

describe('RegisterPage', () => {
  it('should render register form', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should validate password length', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), '123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockSetAuth).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/feed');
    });
  });
});

