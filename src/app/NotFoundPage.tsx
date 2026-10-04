import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import AppBackdrop from '../components/AppBackdrop';

export default function NotFoundPage() {
  return (
    <div className="bg-jaali-dark relative flex min-h-dvh items-center justify-center bg-night/60 p-4">
      <AppBackdrop />
      <Card className="relative w-full max-w-sm text-center">
        <h1 className="font-display text-xl font-bold text-cream">Page not found</h1>
        <p className="mt-2 text-sm text-cream/65">
          This link does not point to a Yatra Mitra screen.
        </p>
        <Link to="/" className="mt-5 inline-block">
          <Button>Back to home</Button>
        </Link>
      </Card>
    </div>
  );
}
