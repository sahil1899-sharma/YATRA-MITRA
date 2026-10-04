import { createBrowserRouter } from 'react-router-dom';
import LauncherPage from '../features/launcher/LauncherPage';
import HomePage from '../features/passenger/HomePage';
import CircuitDetailPage from '../features/passenger/CircuitDetailPage';
import BookingPage from '../features/passenger/BookingPage';
import ReceiptPage from '../features/passenger/ReceiptPage';
import MyTripsPage from '../features/passenger/MyTripsPage';
import DriverCardPage from '../features/passenger/DriverCardPage';
import RideScreen from '../features/passenger/RideScreen';
import VerifyPage from '../features/passenger/VerifyPage';
import SharePage from '../features/passenger/SharePage';
import DriverTodayPage from '../features/driver/DriverTodayPage';
import DriverTripPage from '../features/driver/DriverTripPage';
import DriverEarningsPage from '../features/driver/DriverEarningsPage';
import DriverLearnPage from '../features/driver/DriverLearnPage';
import DriverProfilePage from '../features/driver/DriverProfilePage';
import PulsePage from '../features/admin/PulsePage';
import VerificationPage from '../features/admin/VerificationPage';
import KioskHomePage from '../features/kiosk/KioskHomePage';
import KioskBookingPage from '../features/kiosk/KioskBookingPage';
import KioskReceiptPage from '../features/kiosk/KioskReceiptPage';
import PassengerShell from './shells/PassengerShell';
import DriverShell from './shells/DriverShell';
import KioskShell from './shells/KioskShell';
import AdminShell from './shells/AdminShell';
import PublicPage from './PublicPage';
import NotFoundPage from './NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <LauncherPage /> },
  {
    path: '/p',
    element: <PassengerShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'circuit/:id', element: <CircuitDetailPage /> },
      { path: 'book/:id', element: <BookingPage /> },
      { path: 'receipt/:tripId', element: <ReceiptPage /> },
      { path: 'driver/:mitraId', element: <DriverCardPage /> },
      { path: 'ride/:tripId', element: <RideScreen /> },
      { path: 'trips', element: <MyTripsPage /> },
    ],
  },
  {
    path: '/d',
    element: <DriverShell />,
    children: [
      { index: true, element: <DriverTodayPage /> },
      { path: 'trip/:tripId', element: <DriverTripPage /> },
      { path: 'earnings', element: <DriverEarningsPage /> },
      { path: 'learn', element: <DriverLearnPage /> },
      { path: 'profile', element: <DriverProfilePage /> },
    ],
  },
  {
    path: '/k',
    element: <KioskShell />,
    children: [
      { index: true, element: <KioskHomePage /> },
      { path: 'book/:id', element: <KioskBookingPage /> },
      { path: 'receipt/:tripId', element: <KioskReceiptPage /> },
    ],
  },
  {
    path: '/a',
    element: <AdminShell />,
    children: [
      { index: true, element: <PulsePage /> },
      { path: 'verification', element: <VerificationPage /> },
    ],
  },
  {
    path: '/verify',
    element: <PublicPage />,
    children: [{ path: ':mitraId', element: <VerifyPage /> }],
  },
  {
    path: '/share',
    element: <PublicPage />,
    children: [{ path: ':token', element: <SharePage /> }],
  },
  { path: '*', element: <NotFoundPage /> },
]);
