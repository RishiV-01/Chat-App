import { useEffect, useState } from 'react';
import { MessageCircle, Briefcase } from 'lucide-react';
import { getOpportunities } from '../../api/opportunityApi';
import useUiStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import Avatar from '../common/Avatar';
import LoadingSpinner from '../common/LoadingSpinner';
import OpportunityMessageModal from './OpportunityMessageModal';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = useAuthStore((s) => s.user?._id);
  const { openOpportunityMessageModal } = useUiStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getOpportunities();
        setOpportunities(data.opportunities);
      } catch (err) {
        console.error('Failed to fetch opportunities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-600';
      case 'archived': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="px-8 pt-4 pb-3">
        <h1 className="text-4xl font-light text-navy-600">Opportunities</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-4">
        {loading ? (
          <LoadingSpinner />
        ) : opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Briefcase size={48} className="mb-4" />
            <p className="text-lg">No opportunities found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map((opp) => {
              const otherParticipant = opp.participants?.find(
                (p) => (p.userId?._id || p.userId) !== currentUserId,
              );
              const otherUser = otherParticipant?.userId;

              return (
                <div
                  key={opp._id}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <Avatar user={otherUser || { name: opp.name }} size="md" />

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-900">{opp.name}</div>
                    <div className="mt-1 flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(opp.status)}`}>
                        {opp.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {opp.participants?.length || 0} participant{(opp.participants?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      {otherUser && (
                        <span className="text-xs text-gray-500">
                          with {otherUser.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openOpportunityMessageModal(opp._id, opp.name)}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <MessageCircle size={16} />
                    Message
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <OpportunityMessageModal />
    </div>
  );
}
