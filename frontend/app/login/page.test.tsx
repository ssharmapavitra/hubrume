import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from './page';
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

describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockSetAuth).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/feed');
    });
  });
});

