import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from './page';
import api from '@/lib/api';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'profile-id' }),
}));
jest.mock('@/lib/api');

describe('ProfilePage', () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        id: 'profile-id',
        name: 'John Doe',
        bio: 'Developer',
        education: [],
        workExperience: [],
        skills: [],
      },
    });
  });

  it('should render profile information', async () => {
    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should download PDF when button is clicked', async () => {
    const user = userEvent.setup();
    (api.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/pdf')) {
        return Promise.resolve({ data: new Blob() });
      }
      return Promise.resolve({
        data: {
          id: 'profile-id',
          name: 'John Doe',
        },
      });
    });

    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const downloadButton = screen.getByText('Download PDF');
    await user.click(downloadButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/profiles/profile-id/pdf', expect.any(Object));
    });
  });
});

