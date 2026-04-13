import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Mail,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Baby,
  Sparkles,
  Star
} from 'lucide-react';
import StarField from '../components/StarField';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const LeadDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, leadsRes] = await Promise.all([
        axios.get(`${API}/api/admin/lead-stats`),
        axios.get(`${API}/api/admin/leads`)
      ]);
      setStats(statsRes.data);
      setLeads(leadsRes.data.leads || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true;
    if (filter === 'converted') return lead.converted;
    if (filter === 'pending') return !lead.converted;
    return lead.source?.includes(filter);
  });

  const getSourceIcon = (source) => {
    if (source?.includes('names') || source?.includes('Name')) return <Baby className="w-4 h-4 text-cyan-400" />;
    if (source?.includes('zodiac') || source?.includes('Zodiac')) return <Star className="w-4 h-4 text-purple-400" />;
    if (source?.includes('lucky') || source?.includes('Lucky')) return <Sparkles className="w-4 h-4 text-amber-400" />;
    return <Mail className="w-4 h-4 text-gray-400" />;
  };

  const getSourceLabel = (source) => {
    if (source?.includes('names') || source?.includes('Name') || source?.includes('Όνομα')) return 'Names';
    if (source?.includes('zodiac') || source?.includes('Zodiac') || source?.includes('Ζώδι')) return 'Zodiac';
    if (source?.includes('lucky') || source?.includes('Lucky') || source?.includes('Τυχερ')) return 'Lucky Elements';
    return 'Other';
  };

  const exportCSV = () => {
    const headers = ['Email', 'Source', 'Date', 'Converted'];
    const rows = leads.map(l => [
      l.email,
      getSourceLabel(l.feature_interest || l.source),
      new Date(l.created_at).toLocaleDateString(),
      l.converted ? 'Yes' : 'No'
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="lead-dashboard">
      <StarField />
      
      <div className="relative z-20 min-h-screen">
        {/* Header */}
        <header className="py-6 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            
            <h1 className="text-2xl font-bold gradient-text">Lead Dashboard</h1>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                className="border-white/20 hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="border-white/20 hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Leads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs text-muted-foreground">All Time</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.total_leads || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Leads</div>
            </motion.div>

            {/* Converted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-xs text-green-400">+{stats?.converted_this_week || 0} this week</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.converted || 0}
              </div>
              <div className="text-sm text-muted-foreground">Converted</div>
            </motion.div>

            {/* Conversion Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.conversion_rate || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </motion.div>

            {/* Pending */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.pending || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pending Follow-up</div>
            </motion.div>
          </div>

          {/* Source Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1 glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Lead Sources
              </h3>
              
              <div className="space-y-3">
                {[
                  { name: 'Names', icon: <Baby className="w-5 h-5" />, color: 'cyan', count: stats?.by_source?.names || 0 },
                  { name: 'Zodiac', icon: <Star className="w-5 h-5" />, color: 'purple', count: stats?.by_source?.zodiac || 0 },
                  { name: 'Lucky Elements', icon: <Sparkles className="w-5 h-5" />, color: 'amber', count: stats?.by_source?.lucky || 0 },
                ].map((source) => (
                  <div 
                    key={source.name}
                    className={`flex items-center justify-between p-3 rounded-xl bg-${source.color}-500/10 border border-${source.color}-500/20`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-${source.color}-400`}>{source.icon}</div>
                      <span className="text-white font-medium">{source.name}</span>
                    </div>
                    <span className={`text-${source.color}-400 font-bold`}>{source.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Leads
                </h3>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                >
                  <option value="all">All Leads</option>
                  <option value="converted">Converted</option>
                  <option value="pending">Pending</option>
                  <option value="names">From Names</option>
                  <option value="zodiac">From Zodiac</option>
                  <option value="lucky">From Lucky</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">EMAIL</th>
                      <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">SOURCE</th>
                      <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">DATE</th>
                      <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-muted-foreground">
                          No leads yet. They will appear here when visitors enter their email.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.slice(0, 10).map((lead, index) => (
                        <tr key={lead.lead_id || index} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-white text-sm">{lead.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {getSourceIcon(lead.feature_interest || lead.source)}
                              <span className="text-sm text-muted-foreground">
                                {getSourceLabel(lead.feature_interest || lead.source)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">
                            {lead.converted ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                Converted
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredLeads.length > 10 && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    Showing 10 of {filteredLeads.length} leads
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeadDashboard;
