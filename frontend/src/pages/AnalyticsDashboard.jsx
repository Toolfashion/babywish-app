import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';
import StarField from '../components/StarField';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      <div className="relative z-20 min-h-screen p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <Button variant="outline" onClick={() => navigate('/')} className="text-white border-white/20">
            <Home className="w-4 h-4 mr-2" /> Home
          </Button>
        </div>
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10">
          <p className="text-white/60 text-center">Analytics coming soon...</p>
        </div>
      </div>
    </div>
  );
};
