import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';
import StarField from '../components/StarField';

function AnalyticsDashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-20 p-8">
        <h1 className="text-2xl font-bold text-white mb-8">Analytics</h1>
        <Button onClick={() => navigate('/')}>Home</Button>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
